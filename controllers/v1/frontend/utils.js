const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate } = require("../../../utils/utilsFunctions.js");

const header_menu = async (req, res, next) => {
    try {
        const fields = req.body;
        let result = await runQuery(`call frontend_headermenu()`);
        
        let menu = result[0][0]["Menu"];
        // menu = menu.replace("//","/");
        menu = JSON.parse(menu);
        let total = menu.length;
        for(let i=0;i<total;i++){
            if(typeof menu[i]==="string"){
                menu[i] = JSON.parse(menu[i]);
                if(typeof menu[i]["submenu"]==="string"){
                    menu[i]["submenu"] = JSON.parse("["+menu[i]["submenu"]+"]");
                }
            }else{
                if(typeof menu[i]["submenu"]==="string"){
                    menu[i]["submenu"] = JSON.parse("["+menu[i]["submenu"]+"]");
                }
            }
        }
        

        res.status(200).json({ status: "success", header_menu: menu });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};


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


const banner_list = async (req, res, next) => {
    try {
        const fields = req.body;
        let result = await runQuery(`call frontend_banner_fetch_list()`);
        
        let list = result[0];

        const total = list.length;

        for (let i = 0; i < total; i++) {

            if (list[i].banner) {
                list[i].banner = CONSTANTS.BASE_UPLOADS_URL + list[i].banner;
            } else {
                list[i].banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
            }            

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

const home_event_popup_details = async (req, res, next) => {
    try {
        const fields = req.params;
        let result = await runQuery(`call frontend_event_fetch_details()`);

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

const page_content = async (req, res, next) => {
    try {
        const fields = req.params;
        
        let errors = {};
        let slug = null;


        if (!fields.slug) {
            errors.slug = "this field is required!";
        } else {
            slug = `'${fields.slug}'`;
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
            pageDetails.section1 = pageDetails.section1.replace(/dataaos/g, "data-aos");
        }
        if (pageDetails.section2) {
            pageDetails.section2 = HTMLDecoderEncoder.decode(pageDetails.section2);
            pageDetails.section2 = pageDetails.section2.replace(/dataaos/g, "data-aos");
        }
        if (pageDetails.section3) {
            pageDetails.section3 = HTMLDecoderEncoder.decode(pageDetails.section3);
            pageDetails.section3 = pageDetails.section3.replace(/dataaos/g, "data-aos");
        }
        if (pageDetails.section4) {
            pageDetails.section4 = HTMLDecoderEncoder.decode(pageDetails.section4);
            pageDetails.section4 = pageDetails.section4.replace(/dataaos/g, "data-aos");
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
    header_menu,
    state_list,
    banner_list,
    home_event_popup_details,
    page_content
};