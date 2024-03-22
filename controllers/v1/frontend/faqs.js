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

        let result = await runQuery(`call frontend_faq_fetch_list(${page},${itemPerPage},${order},${orderBy})`);

        let totalFound = result[0][0].total;

        let totalPages = Math.ceil(totalFound / itemPerPage);

        let list = result[1];

        const total = list.length;

        for (let i = 0; i < total; i++) {

            if (list[i].answer) {
                list[i].answer = HTMLDecoderEncoder.decode(list[i].answer);
                list[i].answer = list[i].answer.replace(/dataaos/g, "data-aos");
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

const page_meta_details = async (req, res, next) => {
    try {
        let result = await runQuery(`call frontend_faq_page_seo_fetch_details()`);
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
    page_meta_details
};