const express = require('express');
const routes = express.Router();
const { upload } = require('../../../utils/FileUploads.js');

const {
    address_list,
    details,
    apply,
    save_customer_feedback,
    save_customer_complain
} = require('../../../controllers/v1/frontend/contact_us.js');

routes.get('/address-list', address_list);
routes.get('/details/:slug', details);
routes.post('/apply', apply);
routes.post('/customer-feedback', save_customer_feedback);
routes.post('/customer-complain', save_customer_complain);


module.exports = routes;

