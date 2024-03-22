const express = require('express');
const routes = express.Router();
const { verifyToken } = require('../../../utils/AuthenticationToken.js');
const {
    login,
    refreash_token,
    verify_token,
    details,
    update_password
} = require('../../../controllers/v1/backend/auth.js');

routes.post('/login', login);
routes.post('/refreash-token', refreash_token);
routes.post('/verify-token', verifyToken, verify_token);
routes.get('/', verifyToken, details);
routes.post('/update-password', verifyToken, update_password);

module.exports = routes;

