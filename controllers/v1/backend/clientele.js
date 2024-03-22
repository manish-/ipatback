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

        let result = await runQuery(`call backend_clientele_pages_fetch_details(${id})`);

        let pageDetails = result[0][0];


        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }
        if (pageDetails.home_text) {
            pageDetails.home_text = HTMLDecoderEncoder.decode(pageDetails.home_text);
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

        let home_text = `'${HTMLDecoderEncoder.encode('<p>dummy</p>')}'`;

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
        // if (!fields.home_text) {
        //     errors.home_text = "this field is required!";
        // } else {
        //     home_text = `'${HTMLDecoderEncoder.encode(fields.home_text)}'`;
        // }

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

        await runQuery(`call backend_clientele_page_update(${userId},${id},${title},${slug},${banner},${status},${home_text},${meta_title},${meta_keywords},${meta_description})`);

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

        let result = await runQuery(`call backend_clientele_pages_update_status(${userId},${id},${status})`);

        let pageDetails = result[0][0];

        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
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

const clientele_items_list = async (req, res, next) => {
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

        let result = await runQuery(`call backend_clientele_items_fetch_list(${status},${page},${itemPerPage},${order},${orderBy})`);

        let totalFound = result[0][0].total;

        let totalPages = Math.ceil(totalFound / itemPerPage);

        let list = result[1];

        const total = list.length;

        for (let i = 0; i < total; i++) {

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

const clientele_items_create = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let alt = null;
        let title = null;
        let status = null;
        let display_on_homepage = null;
        let display_order = null;
        let content = null;

        let thumbnail = null;

        if (!fields.alt) {
            errors.alt = "this field is required!";
        } else {
            alt = `'${fields.alt}'`;
        }
        if (!fields.title) {
            errors.title = "this field is required!";
        } else {
            title = `'${fields.title}'`;
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
        if (!fields.status) {
            errors.status = "this field is required!";
        } else {
            status = `'${fields.status}'`;
        }
        if (!fields.content) {
            errors.content = "this field is required!";
        } else {
            content = `'${HTMLDecoderEncoder.encode(fields.content)}'`;
        }


        const uploadedFiles = req.files;

        if (uploadedFiles.thumbnail) {
            thumbnail = `'${uploadedFiles.thumbnail[0].filename}'`;
        } else {
            errors.thumbnail = "this field is required!";
        }

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_clientele_items_create(${userId},${alt},${title},${thumbnail},${content},${display_order},${display_on_homepage},${status})`);

        if (thumbnail) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.thumbnail[0].filename}`;
            await moveFile(uploadedFiles.thumbnail[0].path, newFilePath);
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

const clientele_items_details = async (req, res, next) => {
    try {
        const fields = req.params;
        let id = null;

        if (fields.id) {
            id = fields.id;
        }

        let result = await runQuery(`call backend_clientele_items_fetch_details(${id})`);

        let pageDetails = result[0][0];


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

const clientele_items_update = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let id = null;
        let alt = null;
        let title = null;
        let status = null;
        let display_on_homepage = null;
        let display_order = null;
        let content = null;
        let thumbnail = null;

        if (fields.id) {
            id = fields.id;
        }
        if (!fields.alt) {
            errors.alt = "this field is required!";
        } else {
            alt = `'${fields.alt}'`;
        }
        if (!fields.title) {
            errors.title = "this field is required!";
        } else {
            title = `'${fields.title}'`;
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

        if (!fields.status) {
            errors.status = "this field is required!";
        } else {
            status = `'${fields.status}'`;
        }

        if (!fields.content) {
            errors.content = "this field is required!";
        } else {
            content = `'${HTMLDecoderEncoder.encode(fields.content)}'`;
        }


        const uploadedFiles = req.files;

        if (uploadedFiles.thumbnail) {
            thumbnail = `'${uploadedFiles.thumbnail[0].filename}'`;
        }

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_clientele_items_update(${userId},${id},${alt},${title},${thumbnail},${content},${display_order},${display_on_homepage},${status})`);

        if (thumbnail) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.thumbnail[0].filename}`;
            await moveFile(uploadedFiles.thumbnail[0].path, newFilePath);
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

const clientele_items_update_status = async (req, res, next) => {
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

        let result = await runQuery(`call backend_clientele_items_update_status(${userId},${id},${status})`);

        let pageDetails = result[0][0];

        if (pageDetails.thumbnail) {
            pageDetails.thumbnail = CONSTANTS.BASE_UPLOADS_URL + pageDetails.thumbnail;
        } else {
            pageDetails.thumbnail = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }
        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
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

const clientele_items_dropdown = async (req, res, next) => {
    try {
        const fields = req.query;

        let result = await runQuery(`SELECT id,title FROM clientele_items `);

        res.status(200).json({ status: "success", list: result });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const client_projects_list = async (req, res, next) => {
    try {
        const fields = req.query;

        let errors = {};

        let id = null;
        let status = null;

        let itemPerPage = 10;
        let page = 1;
        let order = `'asc'`;
        let orderBy = `'title'`;

        if (!fields.id) {
            errors.id = "this field is required!";
        } else {
            id = fields.id;
        }

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

        if (fields.status && fields.status != "all" && fields.status != "-1" && fields.status != "") {
            status = `'${fields.status}'`;
        }


        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }


        let result = await runQuery(`call backend_client_projects_fetch_list(${id},${status},${page},${itemPerPage},${order},${orderBy})`);

        let totalFound = result[0][0].total;

        let totalPages = Math.ceil(totalFound / itemPerPage);

        let list = result[1];

        const total = list.length;

        for (let i = 0; i < total; i++) {
            if (list[i].short_content) {
                list[i].short_content = HTMLDecoderEncoder.decode(list[i].short_content);
            }
            if (list[i].content) {
                list[i].content = HTMLDecoderEncoder.decode(list[i].content);
            }
            if (list[i].case_study) {
                list[i].case_study = HTMLDecoderEncoder.decode(list[i].case_study);
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

const client_projects_details = async (req, res, next) => {
    try {
        const fields = req.params;

        let errors = {};
        let clientId = null;
        let id = null;

        if (!fields.id) {
            errors.id = "this field is required!";
        } else {
            id = fields.id;
        }
        if (!fields.clientId) {
            errors.clientId = "this field is required!";
        } else {
            clientId = fields.clientId;
        }
        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        let result = await runQuery(`call backend_client_projects_fetch_details(${clientId},${id})`);

        let pageDetails = result[0][0];

        if (pageDetails.client_logo) {
            pageDetails.client_logo = CONSTANTS.BASE_UPLOADS_URL + pageDetails.client_logo;
        } else {
            pageDetails.client_logo = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }

        if (pageDetails.short_content) {
            pageDetails.short_content = HTMLDecoderEncoder.decode(pageDetails.short_content);
        }

        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
        }

        if (pageDetails.case_study) {
            pageDetails.case_study = HTMLDecoderEncoder.decode(pageDetails.case_study);
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

const client_projects_create = async (req, res, next) => {
    try {

        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let clientId = null;


        let short_content = null;
        let content = null;
        let state = null;
        let district = null;
        let sector = null;
        let is_case_study_available = null;
        let case_study = null;
        let project_type = null;
        let meta_title = null;
        let meta_description = null;
        let meta_keywords = null;

        let status = null;
        let display_on_homepage = null;
        let display_order = null;

        if (!fields.clientId) {
            errors.clientId = "this field is required!";
        } else {
            clientId = fields.clientId;
        }
        if (!fields.sector) {
            errors.sector = "this field is required!";
        } else {
            sector = fields.sector;
        }

        if (!fields.project_type) {
            errors.project_type = "this field is required!";
        } else {
            project_type = fields.project_type;
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
        if (!fields.is_case_study_available) {
            errors.is_case_study_available = "this field is required!";
        } else if (!fields.is_case_study_available) {
            errors.is_case_study_available = "this field value must be 'yes' or 'no' !";
        } else {
            is_case_study_available = `'${fields.is_case_study_available.toLowerCase()}'`;
        }
        if (fields.is_case_study_available && fields.is_case_study_available === 'yes') {
            if (!fields.case_study) {
                errors.case_study = "this field is required!";
            } else {
                case_study = `'${HTMLDecoderEncoder.encode(fields.case_study)}'`;
            }
        }

        if (!fields.state) {
            errors.state = "this field is required!";
        } else {
            state = `'${fields.state}'`;
        }
        if (!fields.district) {
            errors.district = "this field is required!";
        } else {
            district = `'${fields.district}'`;
            district = (district.trimStart()).trimEnd();
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

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_client_projects_create(${userId},${clientId},${project_type},${sector},${is_case_study_available},${case_study},${short_content},${content},${state},${district},${meta_title},${meta_keywords},${meta_description},${status},${display_order},${display_on_homepage})`);


        res.status(200).json({ status: "success", message: `successfully created.`, "client-id": clientId });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const client_projects_update = async (req, res, next) => {
    try {

        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let id = null;
        let clientId = null;
        let sector = null;
        let is_case_study_available = null;
        let case_study = null;
        let short_content = null;
        let content = null;
        let state = null;
        let district = null;
        let project_type = null;

        let meta_title = null;
        let meta_description = null;
        let meta_keywords = null;

        let display_on_homepage = null;
        let display_order = null;
        let status = null;

        if (!fields.id) {
            errors.id = "this field is required!";
        } else {
            id = fields.id;
        }

        if (!fields.sector) {
            errors.sector = "this field is required!";
        } else {
            sector = fields.sector;
        }

        if (!fields.project_type) {
            errors.project_type = "this field is required!";
        } else {
            project_type = fields.project_type;
        }

        if (!fields.clientId) {
            errors.clientId = "this field is required!";
        } else {
            clientId = fields.clientId;
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
        if (!fields.is_case_study_available) {
            errors.is_case_study_available = "this field is required!";
        } else if (!fields.is_case_study_available) {
            errors.is_case_study_available = "this field value must be 'yes' or 'no' !";
        } else {
            is_case_study_available = `'${fields.is_case_study_available.toLowerCase()}'`;
        }
        if (fields.is_case_study_available && fields.is_case_study_available === 'yes') {
            if (!fields.case_study) {
                errors.case_study = "this field is required!";
            } else {
                case_study = `'${HTMLDecoderEncoder.encode(fields.case_study)}'`;
            }
        }

        if (!fields.state) {
            errors.state = "this field is required!";
        } else {
            state = `'${fields.state}'`;
        }
        if (!fields.district) {
            errors.district = "this field is required!";
        } else {
            district = `'${fields.district}'`;
            district = (district.trimStart()).trimEnd();
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

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_client_projects_update(${userId},${id},${clientId},${sector},${is_case_study_available},${case_study},${short_content},${content},${state},${district},${project_type},${meta_title},${meta_keywords},${meta_description},${status},${display_order},${display_on_homepage})`);

        res.status(200).json({ status: "success", message: `successfully updated.`, "client-id": clientId });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const client_projects_update_status = async (req, res, next) => {
    try {
        const fields = req.body;
        const userId = req.userId;

        let errors = {};
        let clientId = null;
        let id = null;
        let status = null;

        if (!fields.id) {
            errors.id = "this field is required!";
        } else {
            id = fields.id;
        }
        if (!fields.clientId) {
            errors.clientId = "this field is required!";
        } else {
            clientId = fields.clientId;
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

        let result = await runQuery(`call backend_client_projects_update_status(${userId},${clientId},${id},${status})`);

        let pageDetails = result[0][0];

        if (pageDetails.short_content) {
            pageDetails.short_content = HTMLDecoderEncoder.decode(pageDetails.short_content);
        }

        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
        }
        if (pageDetails.case_study) {
            pageDetails.case_study = HTMLDecoderEncoder.decode(pageDetails.case_study);
        }
        res.status(200).json({ status: "success", updateRecord: pageDetails });
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
    update_status,
    clientele_items_list,
    clientele_items_create,
    clientele_items_details,
    clientele_items_update,
    clientele_items_update_status,
    clientele_items_dropdown,
    client_projects_list,
    client_projects_details,
    client_projects_create,
    client_projects_update,
    client_projects_update_status
};