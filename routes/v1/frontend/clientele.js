const express = require('express');
const routes = express.Router();
const { upload } = require('../../../utils/FileUploads.js');

const {
    details,
    project_by_client_id
} = require('../../../controllers/v1/frontend/clientele.js');

routes.get('/details/:slug', details);
routes.get('/details', details);
routes.get('/project-by-client/:id', project_by_client_id);

module.exports = routes;

