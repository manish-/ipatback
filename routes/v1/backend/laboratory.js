const express = require('express');
const routes = express.Router();
const { verifyToken } = require('../../../utils/AuthenticationToken.js');
const {upload}  =require('../../../utils/FileUploads.js');

const {
    details,
    update
} = require('../../../controllers/v1/backend/laboratory.js');

routes.get('/details/:id', verifyToken, details);
routes.post('/update', verifyToken,upload.fields([{name:'banner',maxCount: 1}]),update);

module.exports = routes;

