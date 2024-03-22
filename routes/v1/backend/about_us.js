const express = require('express');
const routes = express.Router();
const { verifyToken } = require('../../../utils/AuthenticationToken.js');
const {upload}  =require('../../../utils/FileUploads.js');

const {
    list,
    create,
    details,
    update,
    update_status
} = require('../../../controllers/v1/backend/about_us.js');

routes.get('/list', verifyToken, list);
routes.post('/create', verifyToken,upload.fields([{name:'banner',maxCount: 1}]),create);
routes.get('/details/:id', verifyToken, details);
routes.post('/update', verifyToken,upload.fields([{name:'banner',maxCount: 1}]),update);
routes.post('/update-status', verifyToken,update_status);

module.exports = routes;

