require("isomorphic-fetch");
const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const session = require('express-session');
const http = require('http');
const WebSocket = require('ws');

const { router, setWss } = require('./server/router')
const authorisedRouter = require('./server/authorisedRouter')

let httpServer
const app = express()
const serverPort = 3000

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/file' }); //for real time notifications webhook form onedrive
setWss(wss)

app.use(express.json())
app.use(session({
    secret: 'onedrive-node-connect',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(router)
app.use(authorisedRouter)

function StartServer() {
    try {
        httpServer = server.listen(serverPort, () => {
            const { port } = httpServer.address()
            console.log(`Successfully Started Server: http://localhost:${port}`)
        })
    } catch (error) {
        console.log(`Error in starting server - ${error}`)
    }
}

function StopServer() {
    try {
        httpServer.close(() => {
            console.log(`Closed http server successfully`)
        })
        // Set a timeout to force shutdown
        setTimeout(() => {
            console.error('Forcing server shutdown');
            process.exit(1);
        }, 5000);
    } catch (error) {
        console.log(`Error in shutting down server - ${error}`)
    }
}

StartServer()

process.on('SIGINT', StopServer)
process.on('SIGTERM', StopServer)