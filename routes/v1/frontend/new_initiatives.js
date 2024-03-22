const express = require('express');
const routes = express.Router();

const {
    list,
    details,
    page_meta_details
} = require('../../../controllers/v1/frontend/new_initiatives.js');

routes.get('/list', list);
routes.get('/details/:slug', details);
routes.get('/meta-details', page_meta_details);

module.exports = routes;

