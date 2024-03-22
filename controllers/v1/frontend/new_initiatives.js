const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate } = require("../../../utils/utilsFunctions.js");

const list = async (req, res, next) => {
    try {
        const fields = req.query;
        // console.log(fields);
        let itemPerPage = 10;
        let page = 1;
        let order = `'asc'`;
        let orderBy = `'display_order'`;
        let display_on_homepage = null;

        if (fields.itemPerPage > 0) {
            itemPerPage = fields.itemPerPage;
        }
        if (fields.page > 0) {
            page = fields.page;
        }

        if (fields.display_on_homepage) {
            display_on_homepage = `'${fields.display_on_homepage}'`;
        }
        if (fields.order) {
            order = `'${fields.order}'`;
        }
        if (fields.orderBy) {
            orderBy = `'${fields.orderBy}'`;
        }
        

        let result = await runQuery(`call frontend_new_initiatives_pages_fetch_list(${page},${itemPerPage},${order},${orderBy},${display_on_homepage})`);

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
                list[i].short_content = list[i].short_content.replace(/dataaos/g, "data-aos");
            }
            if (list[i].content) {
                list[i].content = HTMLDecoderEncoder.decode(list[i].content);
                list[i].content = list[i].content.replace(/dataaos/g, "data-aos");
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

        let result = await runQuery(`call frontend_new_initiatives_page_fetch_details(${slug})`);

        let pageDetails = result[0][0];


        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }

        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
            pageDetails.content = pageDetails.content.replace(/dataaos/g, "data-aos");
        }
        if (pageDetails.short_content) {
            pageDetails.short_content = HTMLDecoderEncoder.decode(pageDetails.short_content);
            pageDetails.short_content = pageDetails.short_content.replace(/dataaos/g, "data-aos");
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

const page_meta_details = async (req, res, next) => {
    try {
        
        let result = await runQuery(`call frontend_new_initiatives_page_seo_fetch_details()`);
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
    page_meta_details
};