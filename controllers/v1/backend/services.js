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
        let orderBy = `'title'`;
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

        let result = await runQuery(`call backend_services_fetch_list(${status},${page},${itemPerPage},${order},${orderBy})`);

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
            if (list[i].thumbnail) {
                list[i].thumbnail = CONSTANTS.BASE_UPLOADS_URL + list[i].thumbnail;
            } else {
                list[i].thumbnail = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
            }

            if (list[i].content) {
                   list[i].content = HTMLDecoderEncoder.decode(list[i].content);
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

        let result = await runQuery(`call backend_services_fetch_details(${id})`);

        let pageDetails = result[0][0];

        
        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }
        if (pageDetails.thumbnail) {
            pageDetails.thumbnail = CONSTANTS.BASE_UPLOADS_URL + pageDetails.thumbnail;
        } else {
            pageDetails.thumbnail = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }
        
        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
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
        let title = null;
        let slug = null;
        let content = null;
        let status = null;

        let meta_title = null;
        let meta_description = null;
        let meta_keywords = null;

        let banner = null;
        let thumbnail = null;
        
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
        if (!fields.content) {
            errors.content = "this field is required!";
        } else {
            content = `'${HTMLDecoderEncoder.encode(fields.content)}'`;
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
        }else{
            errors.banner = "this field is required!";
        }
        if (uploadedFiles.thumbnail) {
            thumbnail = `'${uploadedFiles.thumbnail[0].filename}'`;
        }else{
            errors.thumbnail = "this field is required!";
        }

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_services_create(${userId},${title},${slug},${content},${banner},${thumbnail},${status},${meta_title},${meta_keywords},${meta_description})`);

        if (banner) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.banner[0].filename}`;
            await moveFile(uploadedFiles.banner[0].path, newFilePath);
        }
        if (thumbnail) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.thumbnail[0].filename}`;
            await moveFile(uploadedFiles.thumbnail[0].path, newFilePath);
        }
        
        let message = `"${title}" has been created successfully.`;
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
        let title = null;
        let slug = null;
        let content = null;
        let status = null;

        let meta_title = null;
        let meta_description = null;
        let meta_keywords = null;

        let banner = null;
        let thumbnail = null;

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
        if (!fields.content) {
            errors.content = "this field is required!";
        } else {
            content = `'${HTMLDecoderEncoder.encode(fields.content)}'`;
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
        if (uploadedFiles.thumbnail) {
            thumbnail = `'${uploadedFiles.thumbnail[0].filename}'`;
        }

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_services_update(${userId},${id},${title},${slug},${content},${banner},${thumbnail},${status},${meta_title},${meta_keywords},${meta_description})`);

        if (banner) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.banner[0].filename}`;
            await moveFile(uploadedFiles.banner[0].path, newFilePath);
        }
        if (thumbnail) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.thumbnail[0].filename}`;
            await moveFile(uploadedFiles.thumbnail[0].path, newFilePath);
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

        let result = await runQuery(`call backend_services_update_status(${userId},${id},${status})`);

        let pageDetails = result[0][0];

        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }
        if (pageDetails.thumbnail) {
            pageDetails.thumbnail = CONSTANTS.BASE_UPLOADS_URL + pageDetails.thumbnail;
        } else {
            pageDetails.thumbnail = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }
        
        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
        }

        let message = `"${pageDetails.title}" has been ${status} successfully.`;

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