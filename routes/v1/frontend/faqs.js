const express = require('express');
const routes = express.Router();
const { upload } = require('../../../utils/FileUploads.js');

const {
    list,
    page_meta_details
} = require('../../../controllers/v1/frontend/faqs.js');

routes.get('/list', list);
routes.get('/meta-details', page_meta_details);

module.exports = routes;

