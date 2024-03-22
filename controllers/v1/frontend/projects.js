const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate } = require("../../../utils/utilsFunctions.js");


const sectors_list = async (req, res, next) => {
    try {
        const fields = req.query;

        let result = await runQuery(`SELECT DISTINCT clientele_projects.sector_id,projects.title,projects.slug FROM clientele_projects LEFT JOIN projects ON clientele_projects.sector_id = projects.id WHERE projects.status='active' AND clientele_projects.status ='active' AND clientele_projects.id IS NOT NULL`);

        res.status(200).json({ status: "success", list: result});
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const list = async (req, res, next) => {
    try {
        const fields = req.query;

        let itemPerPage = 10;
        let page = 1;
        let order = `'asc'`;
        let orderBy = `'display_order'`;
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

        let result = await runQuery(`call frontend_projects_fetch_list(${page},${itemPerPage},${order},${orderBy},${state})`);

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
            // if (list[i].thumbnail) {
            //     list[i].thumbnail = CONSTANTS.BASE_UPLOADS_URL + list[i].thumbnail;
            // } else {
            //     list[i].thumbnail = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
            // }

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

        let result = await runQuery(`call frontend_projects_fetch_details(${slug})`);

        let pageDetails = result[0][0];
        let statesList = result[1];


        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }
        // if (pageDetails.thumbnail) {
        //     pageDetails.thumbnail = CONSTANTS.BASE_UPLOADS_URL + pageDetails.thumbnail;
        // } else {
        //     pageDetails.thumbnail = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        // }

        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
            pageDetails.content = pageDetails.content.replace(/dataaos/g, "data-aos");
        }
        if (pageDetails.case_study) {
            pageDetails.case_study = HTMLDecoderEncoder.decode(pageDetails.case_study);
            pageDetails.case_study = pageDetails.case_study.replace(/dataaos/g, "data-aos");
        }
        pageDetails.statesList = statesList;
        // console.log("pageDetails", pageDetails);
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

const list_by = async (req, res, next) => {
    try {
        const fields = req.query;

        let clientId = null;
        let projectId = null;
        let state = null;


        if (fields.clientId) {
            clientId = `'${fields.clientId}'`;
        }
        if (fields.projectId) {
            projectId = `'${fields.projectId}'`;
        }
        if (fields.state) {
            state = `'${fields.state}'`;
        }

        let result = await runQuery(`call frontend_client_projects_fetch_list(${clientId},${projectId},${state})`);

        let list = result[0];

        const total = list.length;

        for (let i = 0; i < total; i++) {

            if (list[i].short_content) {
                list[i].short_content = HTMLDecoderEncoder.decode(list[i].short_content);
                list[i].short_content = list[i].short_content.replace(/dataaos/g, "data-aos");
            }
            if (list[i].content) {
                list[i].content = HTMLDecoderEncoder.decode(list[i].content);
                list[i].content = list[i].content.replace(/dataaos/g, "data-aos");
            }
            if (list[i].case_study) {
                list[i].case_study = HTMLDecoderEncoder.decode(list[i].case_study);
                list[i].case_study = list[i].case_study.replace(/dataaos/g, "data-aos");
            }

            list[i].id_text = Buffer.from(list[i].id.toString()).toString('base64');

        }
        res.status(200).json({ status: "success", list: list });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const list_home = async (req, res, next) => {
    try {
        const fields = req.query;

        let state = null;

        if (fields.state) {
            state = `'${fields.state}'`;
        }

        let result = await runQuery(`call frontend_projects_list_home(${state})`);

        let list = result[0];

        const total = list.length;

        let filteredList = [];
        for (let i = 0; i < total; i++) {
            if (list[i].projects) {
                list[i].projects = JSON.parse("[" + list[i].projects + "]");
                for (let j = 0; j < list[i].projects.length; j++) {
                    if (list[i].projects[j].short_content) {
                        list[i].projects[j].short_content = HTMLDecoderEncoder.decode(list[i].projects[j].short_content);
                        list[i].projects[j].short_content = list[i].projects[j].short_content.replace(/dataaos/g, "data-aos");
                    }

                    if (list[i].projects[j].content) {
                        list[i].projects[j].content = HTMLDecoderEncoder.decode(list[i].projects[j].content);
                        list[i].projects[j].content = list[i].projects[j].content.replace(/dataaos/g, "data-aos");
                    }
                    list[i].projects[j].id_text = Buffer.from(list[i].projects[j].id.toString()).toString('base64');
                }

                filteredList[filteredList.length] = list[i];
            }
        }

        res.status(200).json({ status: "success", list: filteredList });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const project_details = async (req, res, next) => {
    try {
        const fields = req.params;

        let id = null;

        if (fields.id) {
            id = Buffer.from(fields.id, 'base64').toString('ascii');
        }

        let result = await runQuery(`call frontend_client_projects_fetch_details(${id})`);

        let details = result[0][0];


        if (details.short_content) {
            details.short_content = HTMLDecoderEncoder.decode(details.short_content);
            details.short_content = details.short_content.replace(/dataaos/g, "data-aos");
        }
        if (details.content) {
            details.content = HTMLDecoderEncoder.decode(details.content);
            details.content = details.content.replace(/dataaos/g, "data-aos");
        }
        if (details.case_study) {
            details.case_study = HTMLDecoderEncoder.decode(details.case_study);
            details.case_study = details.case_study.replace(/dataaos/g, "data-aos");
        }

        if (details.client_content) {
            details.client_content = HTMLDecoderEncoder.decode(details.client_content);
            details.client_content = details.client_content.replace(/dataaos/g, "data-aos");
        }

        if (details.client_thumbnail) {
            details.client_thumbnail = CONSTANTS.BASE_UPLOADS_URL + details.client_thumbnail;
        } else {
            details.client_thumbnail = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }

        details.id_text = Buffer.from(details.id.toString()).toString('base64');


        res.status(200).json({ status: "success", details: details });
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
    sectors_list,
    list,
    details,
    list_by,
    list_home,
    project_details
};