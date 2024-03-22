const express = require('express');
const routes = express.Router();
const {upload}  =require('../../../utils/FileUploads.js');

const {
    details
} = require('../../../controllers/v1/frontend/downloads.js');

routes.get('/details/:slug', details);

module.exports = routes;

