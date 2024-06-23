const auth = require('../controllers/auth')

// Refresh token middleware
function refreshTokenIfNeeded(req, res, next) {
    if (req.session.accessToken && new Date() > req.session.expiresOn) {
        const refreshTokenRequest = {
            refreshToken: req.session.refreshToken,
            scopes: ["user.read", "files.read", "files.read.all"],
        };

        auth.getAuthClient().acquireTokenByRefreshToken(refreshTokenRequest).then((response) => {
            req.session.accessToken = response.accessToken;
            req.session.expiresOn = response.expiresOn;
            next();
        }).catch((error) => {
            console.log(error);
            res.redirect('/');
        });
    } else {
        next();
    }
}

module.exports = { refreshTokenIfNeeded }