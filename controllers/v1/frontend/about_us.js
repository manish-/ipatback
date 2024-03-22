const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate } = require("../../../utils/utilsFunctions.js");

const details = async (req, res, next) => {
    try {
        const fields = req.params;
        let pageSlug = null;

        if (fields.slug) {
            pageSlug = `'${fields.slug}'`;
        }

        let result = await runQuery(`call frontend_aboutus_pages_fetch_details(${pageSlug})`);

        let pageDetails = result[0][0];

        
        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }
        
        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
            pageDetails.content = pageDetails.content.replace(/dataaos/g,"data-aos");
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
        }else {
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

module.exports = {
    details
};