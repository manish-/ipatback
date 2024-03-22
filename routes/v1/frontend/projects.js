const express = require('express');
const routes = express.Router();
const { upload } = require('../../../utils/FileUploads.js');

const {
    sectors_list,
    list,
    details,
    list_by,
    list_home,
    project_details
} = require('../../../controllers/v1/frontend/projects.js');

routes.get('/list', list);
routes.get('/details/:slug', details);
routes.get('/list-by', list_by);
routes.get('/list-home', list_home);
routes.get('/project-details/:id', project_details);

routes.get('/sectors-list', sectors_list);

module.exports = routes;

