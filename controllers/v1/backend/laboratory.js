const fs = require('fs');
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

        let result = await runQuery(`call backend_laboratory_page_fetch_details(${id})`);

        let pageDetails = result[0][0];

        
        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
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

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_laboratory_page_update(${userId},${id},${title},${slug},${content},${banner},${status},${meta_title},${meta_keywords},${meta_description})`);

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

module.exports = {
    details,
    update
};