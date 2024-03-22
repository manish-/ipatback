const express = require('express');
const routes = express.Router();
const { upload } = require('../../../utils/FileUploads.js');

const {
    list,
    details
} = require('../../../controllers/v1/frontend/seminars.js');

routes.get('/list',  list);
routes.get('/details/:slug',  details);

module.exports = routes;

