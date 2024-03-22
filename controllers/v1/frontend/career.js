const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const REGX = require("../../../utils/Regx.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate } = require("../../../utils/utilsFunctions.js");

const list = async (req, res, next) => {
    try {
        const fields = req.query;

        let itemPerPage = 10;
        let page = 1;
        let order = `'desc'`;
        let orderBy = `'last_updated_at'`;
        let state = null;

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
        if (fields.state) {
            state = `'${fields.state}'`;
        }

        let result = await runQuery(`call frontend_career_fetch_list(${page},${itemPerPage},${order},${orderBy},${state})`);

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
                list[i].short_content = list[i].short_content.replace(/dataaos/g,"data-aos");
            }

            if (list[i].content) {
                list[i].content = HTMLDecoderEncoder.decode(list[i].content);
                list[i].content = list[i].content.replace(/dataaos/g,"data-aos");
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
        let slug = null;

        if (fields.slug) {
            slug = `'${fields.slug}'`;
        }

        let result = await runQuery(`call frontend_career_fetch_details(${slug})`);

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
            pageDetails.content = pageDetails.content.replace(/dataaos/g,"data-aos");
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

const apply = async (req, res, next) => {
    try {
        const fields = req.body;
        let id = null;

        let firstName = null;
        let lastName = null;
        let email = null;
        let mobile = null;
        let currentCompany = null;
        let designation = null;
        let currentCTC = null;
        let experience = null;

        if (fields.id) {
            id = fields.id;
        }
        if (!fields.firstName) {
            errors.firstName = "this field is required!";
        } else if(!REGX.FIRST_NAME.test(fields.firstName)){
            errors.firstName = "only alphabets and whitespace is allowed!";
        }else {
            firstName = `'${fields.firstName}'`;
        }
        if (!fields.lastName) {
            errors.lastName = "this field is required!";
        } else if(!REGX.LAST_NAME.test(fields.lastName)){
            errors.lastName = "only alphabets and whitespace is allowed!";
        }else {
            lastName = `'${fields.lastName}'`;
        }
        if (!fields.email) {
            errors.email = "this field is required!";
        } else if(!REGX.EMAIL.test(fields.email)){
            errors.email = "enter correct email id!";
        } else {
            email = `'${fields.email}'`;
        }
        if (!fields.mobile) {
            errors.mobile = "this field is required!";
        } else if(!REGX.MOBILE_NUMBER.test(fields.mobile)){
            errors.mobile = "enter correct mobile number!";
        } else {
            mobile = `'${fields.mobile}'`;
        }
        if (!fields.currentCompany) {
            errors.currentCompany = "this field is required!";
        } else {
            currentCompany = `'${fields.currentCompany}'`;
        }
        if (!fields.designation) {
            errors.designation = "this field is required!";
        } else {
            designation = `'${fields.designation}'`;
        }
        if (!fields.currentCTC) {
            errors.currentCTC = "this field is required!";
        } else {
            currentCTC = `'${fields.currentCTC}'`;
        }
        if (!fields.experience) {
            errors.experience = "this field is required!";
        } else {
            experience = `'${fields.experience}'`;
        }

        await runQuery(`call frontend_career_apply(${id},${firstName},${lastName},${email},${mobile},${currentCompany},${designation},${currentCTC},${experience})`);

        res.status(200).json({ status: "success", message: 'A request has been sent successfully.' });
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
        let result = await runQuery(`call frontend_career_page_seo_fetch_details()`);
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


module.exports = {
    list,
    details,
    apply,
    page_meta_details
};