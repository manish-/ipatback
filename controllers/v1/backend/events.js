const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate,slugify } = require("../../../utils/utilsFunctions.js");


const details = async (req, res, next) => {
    try {
        const fields = req.params;
        let result = await runQuery(`call backend_event_fetch_details()`);

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

const update = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let title = null;
        let sub_title = null;
        let status = null;
        let content = null;
        let thumbnail = null;

        if (!fields.title) {
            errors.title = "this field is required!";
        }else{
            title = `'${fields.title}'`;
        }
        if (fields.sub_title) {
            sub_title = `'${fields.sub_title}'`;
        }

        if (!fields.content) {
            errors.content = "this field is required!";
        } else {
            content = `'${HTMLDecoderEncoder.encode(fields.content)}'`;
        }
        if (!fields.status) {
            errors.status = "this field is required!";
        } else {
            status = `'${fields.status}'`;
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

        await runQuery(`call backend_event_fetch_update(${userId},${title},${sub_title},${thumbnail},${content},${status})`);

        if (thumbnail) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.thumbnail[0].filename}`;
            await moveFile(uploadedFiles.thumbnail[0].path, newFilePath);
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
    details,
    update
};