const { Router } = require('express')
const https = require('https');
const path = require('path')
const fs = require('fs')
const middleware = require('../middlewares/sessionToken')
const onedrive = require('../controllers/onedrive')

const router = Router()
router.use(middleware.refreshTokenIfNeeded)

//homepage
router.get('/home', async (req, res) => {
    console.log('received /home request')
    if (!req.session.accessToken) {
        return res.redirect('/');
    }
    try {
        const user = await onedrive.getUserDetails(req.session.accessToken)
        const { directories, files } = await onedrive.listFiles(req.session.accessToken)
        res.render('home', {
            user,
            files,
            directories
        });

    } catch (error) {
        console.log(`error in home`)
        console.log(JSON.stringify(error));
        res.status(500).send('Error retrieving homepage data');
    }
});

//file details
router.get('/file/:fileId', async (req, res) => {
    console.log('received /file/:fileId request: ', req.params.fileId)

    if (!req.session.accessToken) {
        return res.redirect('/');
    }

    try {
        const { fileInfo, filePermissions}  = await onedrive.getFileDetails(req.session.accessToken, req.params.fileId)
        res.render('fileDetails', {
            file: fileInfo,
            permissions: filePermissions
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error retrieving file details');
    }
});

//download file: not used for now
router.get('/file/:fileId/download', async (req, res) => {
    console.log('received /file/:fileId/download request: ', req.params.fileId)

    if (!req.session.accessToken) {
        return res.redirect('/');
    }
    var localFilePath = '';
    try {
        const { fileInfo } = await onedrive.getFileDetails(req.session.accessToken, req.params.fileId);
        fileUrl = fileInfo['@microsoft.graph.downloadUrl']
        localFilePath = path.join(__dirname, '..', `${fileInfo.name}`);
        const writer = fs.createWriteStream(localFilePath);

        https.get(fileUrl, function(response) {
            response.pipe(writer);
            
            writer.on('finish', function() {
                writer.close(() => {
                    console.log('File downloaded successfully');
                });
            });
            writer.on('error', (error) => {
                console.log(error);
                fs.unlink(localFilePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                        return;
                    }
                    console.log('File deleted successfully');
                });
                res.status(500).send('Error downloading file');
            });
        }).on('error', function(err) {
            fs.unlink(localFilePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    return;
                }
                console.log('File deleted successfully');
            });
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading file');
        });
    } catch (error) {
        console.log(error);
        fs.unlink(localFilePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return;
            }
            console.log('File deleted successfully');
        });
        res.status(500).send('Error retrieving file content');
    }
});

//create a subscription for real time notifications
router.get('/subscribe', async (req, res) => {
    console.log('received /subscribe request');
    if (!req.session.accessToken) {
        return res.redirect('/');
    }
    try {
        //create subscription for permission updates of files in the root directory
        const response = await onedrive.createSubscription(req.session.accessToken, process.env.NOTIFICATION_WEBHOOK_HOST);
        console.log("subscription created successfully: ", response);
        res.render('subscription', {
            response
        });
    } catch (error) {
        console.log('Error creating subscription');
        console.log(error);
        res.status(500).send(`Error creating subscription: ${JSON.stringify(error)}`);
    }
});

module.exports = router