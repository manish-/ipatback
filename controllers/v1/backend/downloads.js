const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate,slugify } = require("../../../utils/utilsFunctions.js");


const details = async (req, res, next) => {
    try {
        const fields = req.params;
        let id = null;

        if (fields.id) {
            id = fields.id;
        }

        let result = await runQuery(`call backend_download_page_fetch_details(${id})`);

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

const update = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let id = null;
        let title = null;
        let slug = null;
        let status = null;

        let meta_title = null;
        let meta_description = null;
        let meta_keywords = null;

        let banner = null;
        
        if (fields.id) {
            id = fields.id;
        }
        if (!fields.title) {
            errors.title = "this field is required!";
        } else {
            title = `'${fields.title}'`;
        }
        if (!fields.slug) {
            errors.slug = "this field is required!";
        } else {
            slug = `'${slugify(fields.slug)}'`;
        }
        
        if (!fields.meta_title) {
            errors.meta_title = "this field is required!";
        } else {
            meta_title = `'${fields.meta_title}'`;
        }
        if (!fields.meta_description) {
            errors.meta_description = "this field is required!";
        } else {
            meta_description = `'${fields.meta_description}'`;
        }
        if (!fields.meta_keywords) {
            errors.meta_keywords = "this field is required!";
        } else {
            meta_keywords = `'${fields.meta_keywords}'`;
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

        await runQuery(`call backend_download_page_update(${userId},${id},${title},${slug},${banner},${status},${meta_title},${meta_keywords},${meta_description})`);

        if (banner) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.banner[0].filename}`;
            await moveFile(uploadedFiles.banner[0].path, newFilePath);
        }
        
        let message = `"${title}" has been updated successfully.`;
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

const download_items_list = async (req, res, next) => {
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
        if (fields.status && fields.status != "all" && fields.status != "" && fields.status != '-1') {
            status = `'${fields.status}'`;
        }

        let result = await runQuery(`call backend_download_items_fetch_list(${status},${page},${itemPerPage},${order},${orderBy})`);

        let totalFound = result[0][0].total;

        let totalPages = Math.ceil(totalFound / itemPerPage);

        let list = result[1];

        const total = list.length;

        for (let i = 0; i < total; i++) {

            if (list[i].file) {
                list[i].file = CONSTANTS.BASE_UPLOADS_URL + list[i].file;
            } else {
                list[i].file = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
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

const download_items_create = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let title = null;
        let status = null;

        let file = null;
        
        if (!fields.title) {
            errors.title = "this field is required!";
        } else {
            title = `'${fields.title}'`;
        }
        if (!fields.status) {
            errors.status = "this field is required!";
        } else {
            status = `'${fields.status}'`;
        }


        const uploadedFiles = req.files;

        if (uploadedFiles.file) {
            file = `'${uploadedFiles.file[0].filename}'`;
        }else{
            errors.file = "this field is required!";
        }

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_download_items_create(${userId},${title},${file},${status})`);

        if (file) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.file[0].filename}`;
            await moveFile(uploadedFiles.file[0].path, newFilePath);
        }
        
        let message = `item has been created successfully.`;
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


const download_items_details = async (req, res, next) => {
    try {
        const fields = req.params;
        let id = null;

        if (fields.id) {
            id = fields.id;
        }

        let result = await runQuery(`call backend_download_items_fetch_details(${id})`);

        let pageDetails = result[0][0];

        
        if (pageDetails.file) {
            pageDetails.file = CONSTANTS.BASE_UPLOADS_URL + pageDetails.file;
        } else {
            pageDetails.file = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
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

const download_items_update = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let id = null;
        let title = null;
        let status = null;
        let file = null;
        
        if (fields.id) {
            id = fields.id;
        }
        if (!fields.title) {
            errors.title = "this field is required!";
        } else {
            title = `'${fields.title}'`;
        }        
        if (!fields.status) {
            errors.status = "this field is required!";
        } else {
            status = `'${fields.status}'`;
        }


        const uploadedFiles = req.files;

        if (uploadedFiles.file) {
            file = `'${uploadedFiles.file[0].filename}'`;
        }
       
        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_download_items_update(${userId},${id},${title},${file},${status})`);

        if (file) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.file[0].filename}`;
            await moveFile(uploadedFiles.file[0].path, newFilePath);
        }
        
        let message = `item has been updated successfully.`;
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

const download_items_update_status = async (req, res, next) => {
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

        let result = await runQuery(`call backend_download_items_update_status(${userId},${id},${status})`);

        let pageDetails = result[0][0];

        if (pageDetails.file) {
            pageDetails.file = CONSTANTS.BASE_UPLOADS_URL + pageDetails.file;
        } else {
            pageDetails.file = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }

        let message = `item has been ${status} successfully.`;

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
    details,
    update,
    download_items_list,
    download_items_create,
    download_items_details,
    download_items_update,
    download_items_update_status
};