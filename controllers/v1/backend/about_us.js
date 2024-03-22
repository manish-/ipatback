const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate,slugify } = require("../../../utils/utilsFunctions.js");

const list = async (req, res, next) => {
    try {
        const fields = req.query;
        console.log(fields);
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
        if (fields.status && fields.status !== "all" && fields.status !== "" && fields.status !== "-1") {
            status = `'${fields.status}'`;
        }

        let result = await runQuery(`call backend_aboutus_pages_fetch_list(${status},${page},${itemPerPage},${order},${orderBy})`);

        let totalFound = result[0][0].total;

        let totalPages = Math.ceil(totalFound / itemPerPage);

        let list = result[1];

        const total = list.length;

        for (let i = 0; i < total; i++) {

            if (list[i].children_table) {
                let check_table = await runQuery(`SHOW TABLES LIKE 'children_${list[i].children_table}';`);

                if (check_table.length) {
                    let children_content = await runQuery(`SELECT * FROM children_${list[i].children_table};`);
                    if (children_content.length) {
                        switch (list[i].children_table) {
                            case "key_professionals":
                                for (let z = 0; z < children_content.length; z++) {

                                    if (children_content[z].icon) {
                                        children_content[z].icon = HTMLDecoderEncoder.decode(children_content[z].icon);
                                    }
                                    if (children_content[z].title) {
                                        children_content[z].title = HTMLDecoderEncoder.decode(children_content[z].title);
                                    }
                                    if (children_content[z].content) {
                                        children_content[z].content = HTMLDecoderEncoder.decode(children_content[z].content);
                                    }

                                }
                                list[i].children = children_content;
                                break;
                            default:
                                list[i].children = children_content;
                                break;
                        }
                    }

                }
            }

            if (list[i].banner) {
                list[i].banner = CONSTANTS.BASE_UPLOADS_URL + list[i].banner;
            } else {
                list[i].banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
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


const create = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fields = req.body;

        let errors = {};

        let title = null;
        let slug = null;
        let content = null;
        let status = null;

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

        await runQuery(`call backend_aboutus_page_created(${userId},${title},${slug},${content},${banner},${status},${meta_title},${meta_keywords},${meta_description})`);

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

const details = async (req, res, next) => {
    try {
        const fields = req.params;
        let pageId = null;

        if (fields.id) {
            pageId = fields.id;
        }

        let result = await runQuery(`call backend_aboutus_pages_fetch_details(${pageId})`);

        let pageDetails = result[0][0];


        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }

        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
            // pageDetails.content = pageDetails.content;
        }

        if (pageDetails.children_table) {
            let check_table = await runQuery(`SHOW TABLES LIKE 'children_${pageDetails.children_table}';`);

            if (check_table.length) {
                let children_content = await runQuery(`SELECT * FROM children_${pageDetails.children_table};`);
                if (children_content.length) {
                    pageDetails.has_children = true;
                    switch (pageDetails.children_table) {
                        case "key_professionals":
                            for (let z = 0; z < children_content.length; z++) {

                                if (children_content[z].icon) {
                                    children_content[z].icon = HTMLDecoderEncoder.decode(children_content[z].icon);
                                }
                                if (children_content[z].title) {
                                    children_content[z].title = HTMLDecoderEncoder.decode(children_content[z].title);
                                }
                                if (children_content[z].content) {
                                    children_content[z].content = HTMLDecoderEncoder.decode(children_content[z].content);
                                }

                            }
                            pageDetails.children = children_content;
                            break;
                        default:
                            pageDetails.children = children_content;
                            break;
                    }
                } else {
                    pageDetails.has_children = false;
                }

            } else {
                pageDetails.has_children = false;
            }
        } else {
            pageDetails.has_children = false;
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
        let pageId = null;
        let title = null;
        let slug = null;
        let content = null;
        let status = null;
        let children = null;

        let meta_title = null;
        let meta_description = null;
        let meta_keywords = null;

        let banner = null;

        if (fields.pageId) {
            pageId = fields.pageId;
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
        if (fields.has_children=="true") {
            if (fields.children) {
                children = JSON.parse(fields.children);
            }
        } else {
            if (!fields.content) {
                errors.content = "this field is required!";
            } else {
                content = `'${HTMLDecoderEncoder.encode(fields.content)}'`;
                // content = `'${fields.content}'`;
            }
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

        await runQuery(`call backend_aboutus_page_update(${userId},${pageId},${title},${slug},${content},${banner},${status},${meta_title},${meta_keywords},${meta_description})`);

        if (fields.has_children=="true") {
            let page_details = await runQuery(`select * from  about_us_pages where id =${pageId} `);

            if (page_details[0].children_table) {

                let check_table = await runQuery(`SHOW TABLES LIKE 'children_${page_details[0].children_table}';`);

                if (check_table.length) {
                    for (let i = 0; i < children.length; i++) {
                        let id = children[i].id ? children[i].id : null;
                        let icon = children[i].icon ? `'${HTMLDecoderEncoder.encode(children[i].icon)}'` : null;
                        let title = children[i].title ? `'${children[i].title}'` : null;
                        let content = children[i].content ? `'${HTMLDecoderEncoder.encode(children[i].content)}'` : null;
                        if (id) {
                            await runQuery(`update children_${page_details[0].children_table} set title = ${title},icon=${icon},content=${content} where id = ${id}`);
                        }

                    }
                }
            }
        }

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
        let pageId = null;
        let status = null;

        if (!fields.pageId) {
            errors.pageId = "this field is required!";
        } else {
            pageId = fields.pageId;
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

        let result = await runQuery(`call backend_aboutus_pages_update_status(${userId},${pageId},${status})`);

        let pageDetails = result[0][0];

        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
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

module.exports = {
    list,
    create,
    details,
    update,
    update_status
};