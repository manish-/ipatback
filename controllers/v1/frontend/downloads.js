const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate } = require("../../../utils/utilsFunctions.js");

const details = async (req, res, next) => {
    try {
        const fields = req.params;
        let pageSlug = null;
        let errors = {};

        if (fields.slug) {
            pageSlug = `'${fields.slug}'`;
        }else{
            errors.slug = "this field is required!";
        }

        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }
        
        let result = await runQuery(`call frontend_downloads_page_fetch_details(${pageSlug})`);

        let pageDetails = result[0][0];
        let pageItems = result[1];

        
        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }
        
        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
            pageDetails.content = pageDetails.content.replace(/dataaos/g,"data-aos");
        }

        let total = pageItems.length;
        for(let i=0;i<total;i++){
            if (pageItems[i].file_url) {
                pageItems[i].file_url = CONSTANTS.BASE_UPLOADS_URL + pageItems[i].file_url;
            } else {
                pageItems[i].file_url = null;
            }
        }

        pageDetails.itemList = pageItems;

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