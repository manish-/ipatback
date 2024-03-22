const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate } = require("../../../utils/utilsFunctions.js");

const details = async (req, res, next) => {
    try {
        const fields = req.params;
        let pageSlug = null;
        let firstRow = 0;

        if (fields.slug) {
            pageSlug = `'${fields.slug}'`;
        }else{
            firstRow = 1;
        }

        let result = await runQuery(`call frontend_clientele_page_fetch_details(${pageSlug},${firstRow})`);

        let pageDetails = result[0][0];
        let pageItems = result[1];


        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }

        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
            pageDetails.content = pageDetails.content.replace(/dataaos/g, "data-aos");
        }
        if (pageDetails.home_text) {
            pageDetails.home_text = HTMLDecoderEncoder.decode(pageDetails.home_text);
            pageDetails.home_text = pageDetails.home_text.replace(/dataaos/g, "data-aos");
        }

        let total = pageItems.length;
        for (let i = 0; i < total; i++) {
            if (pageItems[i].thumbnail) {
                pageItems[i].thumbnail = CONSTANTS.BASE_UPLOADS_URL + pageItems[i].thumbnail;
            } else {
                pageItems[i].thumbnail = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
            }
        }

        pageDetails.pageItems = pageItems;

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

const project_by_client_id = async (req, res, next) => {
    try {
        const fields = req.params;
        let client_id = null;

        let itemPerPage = 10;
        let page = 1;
        let order = `'asc'`;
        let orderBy = `'display_order'`;

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

        if (fields.id) {
            client_id = fields.id;
        }

        let result = await runQuery(`call frontend_projects_list_by_client(${client_id},${page},${itemPerPage},${order},${orderBy})`);

        let totalFound = result[0][0].total;

        let totalPages = Math.ceil(totalFound / itemPerPage);

        let list = result[1];

        let details = result[2][0];
        if (details.thumbnail) {
            details.thumbnail = CONSTANTS.BASE_UPLOADS_URL + details.thumbnail;
        } else {
            details.thumbnail = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }

        const total = list.length;

        for (let i = 0; i < total; i++) {

            if (list[i].case_study) {
                list[i].case_study = HTMLDecoderEncoder.decode(list[i].case_study);
                list[i].case_study = list[i].case_study.replace(/dataaos/g, "data-aos");
            }
            if (list[i].short_content) {
                list[i].short_content = HTMLDecoderEncoder.decode(list[i].short_content);
                list[i].short_content = list[i].short_content.replace(/dataaos/g, "data-aos");
            }
            if (list[i].content) {
                list[i].content = HTMLDecoderEncoder.decode(list[i].content);
                list[i].content = list[i].content.replace(/dataaos/g, "data-aos");
            }
            list[i].id_text = Buffer.from(list[i].id.toString()).toString('base64');

        }

        res.status(200).json({ status: "success", details: details, list: list, totalPages: totalPages, totalFound: totalFound });
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
    project_by_client_id
};