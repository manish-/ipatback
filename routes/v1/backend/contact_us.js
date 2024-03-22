const express = require('express');
const routes = express.Router();
const { verifyToken } = require('../../../utils/AuthenticationToken.js');
const { upload } = require('../../../utils/FileUploads.js');

const {
    details,
    update,
    update_status,
    contact_us_enquiry_list,
    customer_complain_list,
    customer_complain_details,
    customer_feedbacks,
    customer_feedbacks_details,
    office_address_list,
    office_address_create,
    office_address_details,
    office_address_update,
    office_address_update_status
} = require('../../../controllers/v1/backend/contact_us.js');

routes.get('/details/:id', verifyToken, details);
routes.post('/update', verifyToken, upload.fields([{ name: 'banner', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), update);
routes.post('/update-status', verifyToken, update_status);
routes.get('/contact-enquiry-list', verifyToken, contact_us_enquiry_list);
routes.get('/customer-complains', verifyToken, customer_complain_list);
routes.get('/customer-complain/:id', verifyToken, customer_complain_details);
routes.get('/customer-feedbacks', verifyToken, customer_feedbacks);
routes.get('/customer-feedback/:id', verifyToken, customer_feedbacks_details);

routes.get('/office-address-list', verifyToken, office_address_list);

routes.post('/office-address-create', verifyToken, office_address_create);

routes.get('/office-address-details/:id', verifyToken, office_address_details);

routes.post('/office-address-update', verifyToken, office_address_update);

routes.post('/office-address-update-status', verifyToken, office_address_update_status);


module.exports = routes;

