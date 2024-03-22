const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate,slugify } = require("../../../utils/utilsFunctions.js");

const list = async (req, res, next) => {
    try {
        const fields = req.query;

        let itemPerPage = 10;
        let page = 1;
        let order = `'asc'`;
        let orderBy = `'id'`;

        let status = null;

        if (fields.itemPerPage > 0) {
            itemPerPage = fields.itemPerPage;
        }
        if (fields.page > 0) {
            page = fields.page;
        }

        if (fields.order) {
            order = `'${fields.order}'`;
        }
        if (fields.orderBy) {
            orderBy = `'${fields.orderBy}'`;
        }

        if (fields.status && fields.status != 'all' && fields.status != '-1') {
            status = `'${fields.status}'`;
        }

        let result = await runQuery(`call backend_banner_fetch_list(${page},${itemPerPage},${order},${orderBy},${status})`);

        let totalFound = result[0][0].total;

        let totalPages = Math.ceil(totalFound / itemPerPage);

        let list = result[1];

        const total = list.length;

        for (let i = 0; i < total; i++) {

            if (list[i].banner) {
                list[i].banner = CONSTANTS.BASE_UPLOADS_URL + list[i].banner;
            } else {
                list[i].banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
            }            

        }

        res.status(200).json({ status: "success", list: list, totalPages: totalPages, totalFound: totalFound });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const details = async (req, res, next) => {
    try {
        const fields = req.params;
        let id = null;

        if (fields.id) {
            id = fields.id;
        }

        let result = await runQuery(`call backend_banner_fetch_details(${id})`);

        let pageDetails = result[0][0];


        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }        

        res.status(200).json({ status: "success", details: pageDetails });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const create = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let heading1 = null;
        let heading2 = null;
        let heading3 = null;
        let link_slug = null;
        let link_title = null;
        let status = null;

        let banner = null;

        if (fields.heading1) {
            heading1 = `'${fields.heading1}'`;
        }
        if (fields.heading2) {
            heading2 = `'${fields.heading2}'`;
        }
        if (fields.heading3) {
            heading3 = `'${fields.heading3}'`;
        }
        if (fields.link_slug) {
            link_slug = `'${fields.link_slug}'`;
        }
        if (fields.link_title) {
            link_title = `'${fields.link_title}'`;
        }
        
        if (!fields.status) {
            errors.status = "this field is required!";
        } else {
            status = `'${fields.status}'`;
        }


        const uploadedFiles = req.files;

        if (uploadedFiles.banner) {
            banner = `'${uploadedFiles.banner[0].filename}'`;
        } else {
            errors.banner = "this field is required!";
        }
        
        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_banner_created(${userId},${heading1},${heading2},${heading3},${link_slug},${link_title},${banner},${status})`);

        if (banner) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.banner[0].filename}`;
            await moveFile(uploadedFiles.banner[0].path, newFilePath);
        }       

        let message = `Banner has been added successfully.`;
        res.status(200).json({ status: "success", message: message });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const update = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let id = null;
        let heading1 = null;
        let heading2 = null;
        let heading3 = null;
        let link_slug = null;
        let link_title = null;
        let status = null;

        let banner = null;
        
        if (fields.id) {
            id = fields.id;
        }else{
            errors.id = "this field is required!";
        }

        if (fields.heading1) {
            heading1 = `'${fields.heading1}'`;
        }
        if (fields.heading2) {
            heading2 = `'${fields.heading2}'`;
        }
        if (fields.heading3) {
            heading3 = `'${fields.heading3}'`;
        }
        if (fields.link_slug) {
            link_slug = `'${fields.link_slug}'`;
        }
        if (fields.link_title) {
            link_title = `'${fields.link_title}'`;
        }
        
        if (!fields.status) {
            errors.status = "this field is required!";
        } else {
            status = `'${fields.status}'`;
        }


        const uploadedFiles = req.files;

        if (uploadedFiles.banner) {
            banner = `'${uploadedFiles.banner[0].filename}'`;
        }
        
        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_banner_update(${userId},${id},${heading1},${heading2},${heading3},${link_slug},${link_title},${banner},${status})`);

        if (banner) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.banner[0].filename}`;
            await moveFile(uploadedFiles.banner[0].path, newFilePath);
        }
        
        let message = `Banner has been updated successfully.`;
        res.status(200).json({ status: "success", message: message });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const update_status = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let id = null;
        let status = null;

        if (!fields.id) {
            errors.id = "this field is required!";
        } else {
            id = fields.id;
        }
        if (!fields.status) {
            errors.status = "this field is required!";
        } else {
            status = `'${fields.status}'`;
        }

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        let result = await runQuery(`call backend_banner_update_status(${userId},${id},${status})`);

        let pageDetails = result[0][0];

        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }
        
        let message = `Banner has been ${status} successfully.`;

        res.status(200).json({ status: "success", message: message, updateRecord: pageDetails });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

module.exports = {
    list,
    details,
    create,
    update,
    update_status
};