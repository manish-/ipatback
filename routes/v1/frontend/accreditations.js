const express = require('express');
const routes = express.Router();
const { upload } = require('../../../utils/FileUploads.js');

const {
    list
} = require('../../../controllers/v1/frontend/accreditations.js');

routes.get('/list', list);
module.exports = routes;

