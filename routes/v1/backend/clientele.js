const express = require('express');
const routes = express.Router();
const { verifyToken } = require('../../../utils/AuthenticationToken.js');
const { upload } = require('../../../utils/FileUploads.js');

const {
    details,
    update,
    update_status,
    clientele_items_list,
    clientele_items_create,
    clientele_items_details,
    clientele_items_update,
    clientele_items_update_status,
    clientele_items_dropdown,
    client_projects_list,
    client_projects_details,
    client_projects_create,
    client_projects_update,
    client_projects_update_status
} = require('../../../controllers/v1/backend/clientele.js');

routes.get('/details/:id', verifyToken, details);

routes.post('/update', verifyToken, upload.fields([{ name: 'banner', maxCount: 1 }]), update);
routes.post('/update-status', verifyToken, update_status);

routes.get('/clientele-items-list', verifyToken, clientele_items_list);

routes.post('/clientele-items-create', verifyToken, upload.fields([{ name: 'thumbnail', maxCount: 1 }]), clientele_items_create);

routes.get('/clientele-items-details/:id', verifyToken, clientele_items_details);

routes.post('/clientele-items-update', verifyToken, upload.fields([{ name: 'thumbnail', maxCount: 1 }]), clientele_items_update);

routes.post('/clientele-items-update-status', verifyToken, clientele_items_update_status);

routes.get('/clientele-items-dropdown', verifyToken, clientele_items_dropdown);

routes.get('/client-projects-list', verifyToken, client_projects_list);
routes.get('/client-projects-details/:clientId/:id', verifyToken, client_projects_details);

routes.post('/client-projects-create', verifyToken, client_projects_create);
routes.post('/client-projects-update', verifyToken, client_projects_update);
routes.post('/client-projects-update-status', verifyToken, client_projects_update_status);

module.exports = routes;

