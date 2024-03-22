const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate,slugify } = require("../../../utils/utilsFunctions.js");

const list = async (req, res, next) => {
    try {
        const fields = req.query;
        // console.log(fields);
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
        if (fields.status !== "all" && fields.status !== "-1" && fields.status !== "") {
            status = `'${fields.status}'`;
        }

        let result = await runQuery(`call backend_new_initiatives_pages_fetch_list(${page},${itemPerPage},${order},${orderBy},${status})`);

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

            if (list[i].short_content) {
                list[i].short_content = HTMLDecoderEncoder.decode(list[i].short_content);
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

        let result = await runQuery(`call backend_new_initiatives_page_fetch_details(${id})`);

        let pageDetails = result[0][0];


        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }

        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
        }
        if (pageDetails.short_content) {
            pageDetails.short_content = HTMLDecoderEncoder.decode(pageDetails.short_content);
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
        let short_content = null;
        let content = null;
        let status = null;

        let display_on_homepage = null;
        let display_order = null;

        let meta_title = null;
        let meta_description = null;
        let meta_keywords = null;

        let banner = null;

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
        if (!fields.short_content) {
            errors.short_content = "this field is required!";
        } else {
            short_content = `'${HTMLDecoderEncoder.encode(fields.short_content)}'`;
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
        if (!fields.display_on_homepage) {
            errors.display_on_homepage = "this field is required!";
        } else {
            display_on_homepage = `'${fields.display_on_homepage}'`;
        }
        if (!fields.display_order || fields.display_order < 1) {
            errors.display_order = "this field is required!";
        } else {
            display_order = fields.display_order;
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

        await runQuery(`call backend_new_initiatives_page_create(${userId},${title},${slug},${short_content},${content},${banner},${status},${meta_title},${meta_keywords},${meta_description},${display_order},${display_on_homepage})`);

        if (banner) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.banner[0].filename}`;
            await moveFile(uploadedFiles.banner[0].path, newFilePath);
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
        let short_content = null;
        let content = null;
        let status = null;

        let display_on_homepage = null;
        let display_order = null;

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
       
        if (!fields.short_content) {
            errors.short_content = "this field is required!";
        } else {
            short_content = `'${HTMLDecoderEncoder.encode(fields.short_content)}'`;
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

        if (!fields.display_on_homepage) {
            errors.display_on_homepage = "this field is required!";
        } else {
            display_on_homepage = `'${fields.display_on_homepage}'`;
        }
        if (!fields.display_order || fields.display_order < 1) {
            errors.display_order = "this field is required!";
        } else {
            display_order = fields.display_order;
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

        await runQuery(`call backend_new_initiatives_page_update(${userId},${id},${title},${slug},${short_content},${content},${banner},${status},${meta_title},${meta_keywords},${meta_description},${display_order},${display_on_homepage})`);

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

        let result = await runQuery(`call backend_new_initiatives_page_update_status(${userId},${id},${status})`);

        let pageDetails = result[0][0];

        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }

        if (pageDetails.short_content) {
            pageDetails.short_content = HTMLDecoderEncoder.decode(pageDetails.short_content);
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

const page_meta_details = async (req, res, next) => {
    try {
        const fields = req.params;
        let id = null;

        if (fields.id) {
            id = fields.id;
        }

        let result = await runQuery(`call backend_new_initiatives_page_seo_fetch_details(${id})`);
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

const page_meta_update = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let id = null;

        let title = null;
        let slug = null;
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
            slug = fields.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            slug = `'${slug}'`;
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


        const uploadedFiles = req.files;

        if (uploadedFiles.banner) {
            banner = `'${uploadedFiles.banner[0].filename}'`;
        }

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_new_initiatives_page_seo_update(${userId},${id},${title},${slug},${banner},${meta_title},${meta_keywords},${meta_description})`);

        if (banner) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.banner[0].filename}`;
            await moveFile(uploadedFiles.banner[0].path, newFilePath);
        }

        let message = `record has been updated successfully.`;
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


module.exports = {
    list,
    details,
    create,
    update,
    update_status,
    page_meta_details,
    page_meta_update
};