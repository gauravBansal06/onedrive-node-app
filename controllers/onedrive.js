// onedrive.js
const auth = require('./auth');

//returns user details
async function getUserDetails(accessToken) {
    const user = await auth.getGraphClient(accessToken).api('/me').get();
    return user;
}

//list files in the root directory
async function listFiles(accessToken) {
    const response = await auth.getGraphClient(accessToken).api(`/me/drive/root/children`).get();
    const directories = response.value.filter(item => item.folder !== undefined);
    const files = response.value.filter(item => item.file !== undefined);
    return { directories, files };
}

//get file info
async function getFileDetails(accessToken, fileId) {
    const encodedFileId = encodeURIComponent(fileId);
    const fileInfo = await auth.getGraphClient(accessToken).api(`/me/drive/items/${encodedFileId}`).get();
    const filePermissionsResponse = await auth.getGraphClient(accessToken).api(`/me/drive/items/${encodedFileId}/permissions`).get();
    const filePermissions = filePermissionsResponse.value;
    return { fileInfo, filePermissions };
}

//create subscription for receiving notifications
async function createSubscription(accessToken, notificationUrl, resource = 'me/drive/root') {
    const subscriptionRequest = {
        changeType: 'updated',
        notificationUrl: notificationUrl+'/webhook',
        resource: resource,
        expirationDateTime: new Date(Date.now() + 3600 * 1000 * 24).toISOString(), // Expires in 24 hours
        clientState: 'onedrive-node-webhook'
    };
    const response = await auth.getGraphClient(accessToken).api('/subscriptions').post(subscriptionRequest);
    return response;
}

//create subscription socketio
async function createSubscriptionSocketIo(accessToken) {
    const response = await auth.getGraphClient(accessToken).api('/me/drive/root/subscriptions/socketIo').get();
    return response;
}

module.exports = {
    getUserDetails,
    listFiles,
    getFileDetails,
    createSubscription,
    createSubscriptionSocketIo
};
