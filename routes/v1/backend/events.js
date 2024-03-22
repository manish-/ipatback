const express = require('express');
const routes = express.Router();
const { verifyToken } = require('../../../utils/AuthenticationToken.js');
const { upload } = require('../../../utils/FileUploads.js');

const {
    details,
    update
} = require('../../../controllers/v1/backend/events.js');

routes.get('/details', verifyToken, details);
routes.post('/update', verifyToken, upload.fields([{ name: 'thumbnail', maxCount: 1 }]), update);

module.exports = routes;

