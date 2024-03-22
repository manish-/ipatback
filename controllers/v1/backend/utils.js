const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate,slugify } = require("../../../utils/utilsFunctions.js");

const state_list = async (req, res, next) => {
    try {
        const fields = req.body;
        let result = await runQuery('SELECT id, name FROM states ORDER BY name ASC');

        result = result;

        res.status(200).json({ status: "success", states: result });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const district_list = async (req, res, next) => {
    try {
        const fields = req.params;
        let state = null;

        if (fields.state) {
            state = ` LOWER('${fields.state}') `;
        }

        let result = await runQuery(`SELECT dt.id, dt.district_name as name FROM states as st LEFT JOIN districts as dt on st.id = dt.state_id where LOWER(st.name) = ${state} ORDER BY dt.district_name ASC`);

        result = result;

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

const project_types = async (req, res, next) => {
    try {
        const fields = req.body;
        let result = await runQuery('SELECT id, project_type FROM project_types ORDER BY project_type ASC');

        result = result;

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

const sectors = async (req, res, next) => {
    try {
        const fields = req.body;
        let result = await runQuery('SELECT id, title,slug FROM projects ORDER BY title ASC');

        result = result;

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

const upload_editor_file = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};

        let file = null;

        const uploadedFiles = req.files;

        if (uploadedFiles.file) {
            file = `'${uploadedFiles.file[0].filename}'`;
        } else {
            errors.file = "this field is required!";
        }

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }
        if (file) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.file[0].filename}`;
            await moveFile(uploadedFiles.file[0].path, newFilePath);
        }

        let file_path = CONSTANTS.BASE_UPLOADS_URL + uploadedFiles.file[0].filename;

        let message = `file has been uploaded successfully.`;
        res.status(200).json({ status: "success", message: message, file_url: file_path });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};


const page_content = async (req, res, next) => {
    try {
        const fields = req.params;
        console.log("fields",fields);

        let errors = {};
        let slug = null;


        if (!fields.slug) {
            errors.slug = "this field is required!";
        } else {
            slug = `'${slugify(fields.slug)}'`;
        }

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        let result = await runQuery(`call frontend_page_content_fetch_details(${slug})`);

        let pageDetails = result[0][0];

        if (pageDetails.image1) {
            pageDetails.image1 = CONSTANTS.BASE_UPLOADS_URL + pageDetails.image1;
        } else {
            pageDetails.image1 = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }
        if (pageDetails.image2) {
            pageDetails.image2 = CONSTANTS.BASE_UPLOADS_URL + pageDetails.image2;
        } else {
            pageDetails.image2 = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }

        if (pageDetails.section1) {
            pageDetails.section1 = HTMLDecoderEncoder.decode(pageDetails.section1);
        }
        if (pageDetails.section2) {
            pageDetails.section2 = HTMLDecoderEncoder.decode(pageDetails.section2);
        }
        if (pageDetails.section3) {
            pageDetails.section3 = HTMLDecoderEncoder.decode(pageDetails.section3);
        }
        if (pageDetails.section4) {
            pageDetails.section4 = HTMLDecoderEncoder.decode(pageDetails.section4);
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

const page_content_update = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let id = null;
        
        let section1 = null;
        let section2 = null;
        let section3 = null;
        let section4 = null;

        let image1 = null;
        let image2 = null;

        if (fields.id) {
            id = fields.id;
        }

        if (!fields.section1) {
            errors.section1 = "this field is required!";
        } else {
            section1 = `'${HTMLDecoderEncoder.encode(fields.section1)}'`;
        }
        if (!fields.section2) {
            errors.section2 = "this field is required!";
        } else {
            section2 = `'${HTMLDecoderEncoder.encode(fields.section2)}'`;
        }
        if (!fields.section3) {
            errors.section3 = "this field is required!";
        } else {
            section3 = `'${HTMLDecoderEncoder.encode(fields.section3)}'`;
        }
        if (!fields.section4) {
            errors.section4 = "this field is required!";
        } else {
            section4 = `'${HTMLDecoderEncoder.encode(fields.section4)}'`;
        }

        const uploadedFiles = req.files;

        if (uploadedFiles.image1) {
            image1 = `'${uploadedFiles.image1[0].filename}'`;
        }
        if (uploadedFiles.image2) {
            image2 = `'${uploadedFiles.image2[0].filename}'`;
        }

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        await runQuery(`call backend_page_content_update(${userId},${id},${section1},${section2},${section3},${section4},${image1},${image2})`);

        if (image1) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.image1[0].filename}`;
            await moveFile(uploadedFiles.image1[0].path, newFilePath);
        }
        if (image2) {
            let newFilePath = `${CONSTANTS.BASE_UPLOADS_PATH}${uploadedFiles.image2[0].filename}`;
            await moveFile(uploadedFiles.image2[0].path, newFilePath);
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
    state_list,
    district_list,
    project_types,
    sectors,
    upload_editor_file,
    page_content,
    page_content_update
};