const express = require('express');
const routes = express.Router();
const { verifyToken } = require('../../../utils/AuthenticationToken.js');
const { upload } = require('../../../utils/FileUploads.js');

const {
    header_menu,
    state_list,
    banner_list,
    home_event_popup_details,
    page_content
} = require('../../../controllers/v1/frontend/utils.js');

routes.get('/header-menu', header_menu);
routes.get('/states', state_list);
routes.get('/banners', banner_list);
routes.get('/home-event-popup-details', home_event_popup_details);
routes.get('/page-content/:slug', page_content);
module.exports = routes;

