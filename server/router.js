const { Router } = require('express')
const auth = require('../controllers/auth');
const WebSocket = require('ws');

const router = Router()

let wss;

//sets wss server instance
function setWss(server) {
  wss = server;
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      console.log('Received ws:', message);
    });
    console.log('Client connected to ws server.');
    ws.send(JSON.stringify({ message: 'Connected to WebSocket server' }));
  });
}

//sets wss server instance
function getWss() {
  return wss;
}

//health check
router.get('/health', async (req, res, next) => {
  console.log('received /health request')
  try {
    res.status(200).json("Server Online !!!! ")
  } catch (error) {
    console.log(`Error in health`)
    console.log(JSON.stringify(error))
    next(error)
  }
})

//root page to display signin
router.get('/', async (req, res, next) => {
  console.log('received / request')
  try {
    url = await auth.getSignInURL()
    res.render('signin', { url });
  } catch (error) {
    console.log(`Error in getting auth url`)
    console.log(JSON.stringify(error))
    next(error)
  }
})

//auth callback post signin
router.get('/auth/callback', async (req, res, next) => {
  console.log('received /auth/callback request')
  try {
    console.log(req.query)
    response = await auth.getAccessTokenFromCode(req.query.code)
    req.session.accessToken = response.accessToken;
    req.session.refreshToken = response.refreshToken;
    req.session.expiresOn = response.expiresOn;
    console.log('successful signin')
    res.redirect('/home');
  } catch (error) {
    console.log(`Error in auth callback`)
    console.log(JSON.stringify(error));
    res.status(500).send('Error during authentication');
  };
})

//logout
router.get('/logout', (req, res) => {
  console.log('received /logout request')
  req.session.destroy();
  res.redirect('/');
});

// Webhook endpoint to receive notifications
router.post('/webhook', (req, res) => {
  console.log('Received webhook notification:', req.body);
  console.log('Received webhook notification query:', req.query);

  if (req.query && req.query.validationToken) {
    // Respond to the validation challenge
    res.status(200).send(req.query.validationToken);
  }

  const notifications = req.body.value;
  if (!notifications) {
    res.status(200).send('No notifications received');
    return;
  }
  notifications.forEach(notification => {
    console.log('Notification received:', notification.resourceData);
    const fileId = notification.resourceData.id;

    // Send notification to all connected clients in case file updated and matches fileId of /file/:fileId
    console.log("connected clients: ", getWss().clients.size);
    getWss().clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'notification',
          fileId: fileId,
          message: `Drive update event received. Please refresh to see latest details.`
        }));
      }
    });
  });

  res.status(202).send('Accepted');
});



module.exports = {
  router,
  setWss,
  getWss
}