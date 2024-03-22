const express = require('express');
const routes = express.Router();
const { verifyToken } = require('../../../utils/AuthenticationToken.js');
const { upload } = require('../../../utils/FileUploads.js');

const {
    state_list,
    district_list,
    project_types,
    sectors,
    upload_editor_file,
    page_content,
    page_content_update
} = require('../../../controllers/v1/backend/utils.js');

routes.get('/states', state_list);
routes.get('/district/:state', district_list);
routes.get('/project-types', project_types);
routes.get('/sectors', sectors);
routes.post('/upload-editor-file', verifyToken, upload.fields([{ name: 'file', maxCount: 1 }]), upload_editor_file);
routes.get('/page-content/:slug', verifyToken, page_content);
routes.post('/page-content-update', verifyToken, upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), page_content_update);
module.exports = routes;

