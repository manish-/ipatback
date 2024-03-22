const express = require('express');
const routes = express.Router();
const { verifyToken } = require('../../../utils/AuthenticationToken.js');
const { upload } = require('../../../utils/FileUploads.js');

const {
    details,
    update,
    download_items_list,
    download_items_create,
    download_items_details,
    download_items_update,
    download_items_update_status
} = require('../../../controllers/v1/backend/downloads.js');

routes.get('/details/:id', verifyToken, details);
routes.post('/update', verifyToken, upload.fields([{ name: 'banner', maxCount: 1 }]), update);

routes.get('/download-items-list', verifyToken, download_items_list);

routes.post('/download-items-create', verifyToken, upload.fields([{ name: 'file', maxCount: 1 }]), download_items_create);

routes.get('/download-item-details/:id', verifyToken, download_items_details);

routes.post('/download-items-update', verifyToken, upload.fields([{ name: 'file', maxCount: 1 }]), download_items_update);

routes.post('/download-items-update-status', verifyToken, download_items_update_status);


module.exports = routes;

