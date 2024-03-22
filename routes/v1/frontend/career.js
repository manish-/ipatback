const express = require('express');
const routes = express.Router();
const { upload } = require('../../../utils/FileUploads.js');

const {
    list,
    details,
    apply,
    page_meta_details
} = require('../../../controllers/v1/frontend/career.js');

routes.get('/list', list);
routes.get('/details/:slug', details);
routes.post('/apply', apply);
routes.get('/meta-details', page_meta_details);

module.exports = routes;

