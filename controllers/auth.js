const { Client } = require('@microsoft/microsoft-graph-client');
const axios = require('axios');
const msal = require('@azure/msal-node');
const res = require('express/lib/response');

const msalConfig = {
    auth: {
        clientId: `${process.env.OAUTH_CLIENT_ID}`,
        // authority: `https://login.microsoftonline.com/${process.env.OAUTH_TENANT_ID}`,
        authority: `https://login.microsoftonline.com/common`,
        clientSecret: `${process.env.OAUTH_CLIENT_SECRET}`,
    }
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

//return auth client
function getAuthClient() {
    return cca
}

// get Microsoft Graph client
function getGraphClient(accessToken) {
    const client = Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        }
    });
    return client
}

//returns ms signin url
async function getSignInURL() {
    const authCodeUrlParameters = {
        scopes: process.env.OAUTH_SCOPES.split(','),
        redirectUri: process.env.OAUTH_REDIRECT_URI,
    };

    response = await getAuthClient().getAuthCodeUrl(authCodeUrlParameters)
    return response
}

//returns access token
async function getAccessTokenFromCode(authCode) {
    const tokenRequest = {
        code: authCode,
        scopes: process.env.OAUTH_SCOPES.split(','),
        redirectUri: process.env.OAUTH_REDIRECT_URI,
    };

   response = await getAuthClient().acquireTokenByCode(tokenRequest)
   return response
}

module.exports = {
    getAuthClient,
    getSignInURL,
    getAccessTokenFromCode,
    getGraphClient
}