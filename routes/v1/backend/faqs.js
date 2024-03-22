const express = require('express');
const routes = express.Router();
const { verifyToken } = require('../../../utils/AuthenticationToken.js');
const { upload } = require('../../../utils/FileUploads.js');

const {
    list,
    create,
    details,
    update,
    update_status,
    meta_details,
    meta_update
} = require('../../../controllers/v1/backend/faqs.js');


routes.get('/list', verifyToken, list);

routes.post('/create', verifyToken, create);

routes.get('/details/:id', verifyToken, details);

routes.post('/update', verifyToken, update);

routes.post('/update-status', verifyToken, update_status);

routes.get('/meta-details/:id', verifyToken, meta_details);
routes.post('/meta-update', verifyToken, upload.fields([{ name: 'banner', maxCount: 1 }]), meta_update);


module.exports = routes;

