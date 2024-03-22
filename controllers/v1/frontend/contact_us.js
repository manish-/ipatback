const runQuery = require('../../../utils/DatabaseCon.js');
const CONSTANTS = require("../../../utils/Constants.js");
const REGX = require("../../../utils/Regx.js");
const { moveFile } = require("../../../utils/FileUploads.js");
const HTMLDecoderEncoder = require("html-encoder-decoder");
const { SQLFormatDate } = require("../../../utils/utilsFunctions.js");

const address_list = async (req, res, next) => {
    try {
        const fields = req.query;


        let result = await runQuery(`call frontend_address_fetch_list()`);

        if (result.length > 0) {
            result = result[0];
        }
        res.status(200).json({ status: "success", list: result, message: "" });
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

        let result = await runQuery(`call frontend_contact_us_page_fetch_details(${slug})`);

        let pageDetails = result[0][0];


        if (pageDetails.banner) {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + pageDetails.banner;
        } else {
            pageDetails.banner = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }
        if (pageDetails.thumbnail) {
            pageDetails.thumbnail = CONSTANTS.BASE_UPLOADS_URL + pageDetails.thumbnail;
        } else {
            pageDetails.thumbnail = CONSTANTS.BASE_UPLOADS_URL + 'notFound.jpg';
        }

        if (pageDetails.content) {
            pageDetails.content = HTMLDecoderEncoder.decode(pageDetails.content);
            pageDetails.content = pageDetails.content.replace(/dataaos/g, "data-aos");
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

        let firstName = null;
        let lastName = null;
        let email = null;
        let mobile = null;
        let company = null;
        let website = null;
        let message = null;

        if (!fields.firstName) {
            errors.firstName = "this field is required!";
        } else if (!REGX.FIRST_NAME.test(fields.firstName)) {
            errors.firstName = "only alphabets and whitespace is allowed!";
        } else {
            firstName = `'${fields.firstName}'`;
        }
        if (!fields.lastName) {
            errors.lastName = "this field is required!";
        } else if (!REGX.LAST_NAME.test(fields.lastName)) {
            errors.lastName = "only alphabets and whitespace is allowed!";
        } else {
            lastName = `'${fields.lastName}'`;
        }
        if (!fields.email) {
            errors.email = "this field is required!";
        } else if (!REGX.EMAIL.test(fields.email)) {
            errors.email = "enter correct email id!";
        } else {
            email = `'${fields.email}'`;
        }
        if (!fields.mobile) {
            errors.mobile = "this field is required!";
        } else if (!REGX.MOBILE_NUMBER.test(fields.mobile)) {
            errors.mobile = "enter correct mobile number!";
        } else {
            mobile = `'${fields.mobile}'`;
        }
        if (!fields.company) {
            errors.company = "this field is required!";
        } else {
            company = `'${fields.company}'`;
        }
        if (!fields.website) {
            errors.website = "this field is required!";
        } else {
            website = `'${fields.website}'`;
        }
        if (!fields.message) {
            errors.message = "this field is required!";
        } else {
            message = `'${fields.message}'`;
        }

        await runQuery(`call frontend_contact_us_enquiry_apply(${firstName},${lastName},${email},${mobile},${company},${website},${message})`);

        res.status(200).json({ status: "success", message: 'Your enquiry has been sent successfully.' });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const save_customer_feedback = async (req, res, next) => {
    try {
        const fields = req.body;

        let projectName = null;
        let workOrderNumber = null;

        let firstName = null;
        let lastName = null;
        let email = null;
        let contactNumber = null;
        
        let state = null;
        let city = null;
        let address = null;

        let qualityOfServiceProvided = null;
        let adherenceToDeliverySchedule = null;
        let knowledgeOfRulesProcedures = null;
        let complaintHandlingResponseTime = null;
        let responseTimeOnQuaeriesByOurExcutives = null;

        let remark = null;

        if (!fields.projectName) {
            errors.projectName = "this field is required!";
        } else {
            projectName = `'${fields.projectName}'`;
        }
        if (!fields.workOrderNumber) {
            errors.workOrderNumber = "this field is required!";
        } else {
            workOrderNumber = `'${fields.workOrderNumber}'`;
        }
        if (!fields.firstName) {
            errors.firstName = "this field is required!";
        } else if (!REGX.FIRST_NAME.test(fields.firstName)) {
            errors.firstName = "only alphabets and whitespace is allowed!";
        } else {
            firstName = `'${fields.firstName}'`;
        }
        if (!fields.lastName) {
            errors.lastName = "this field is required!";
        } else if (!REGX.LAST_NAME.test(fields.lastName)) {
            errors.lastName = "only alphabets and whitespace is allowed!";
        } else {
            lastName = `'${fields.lastName}'`;
        }
        if (!fields.email) {
            errors.email = "this field is required!";
        } else if (!REGX.EMAIL.test(fields.email)) {
            errors.email = "enter correct email id!";
        } else {
            email = `'${fields.email}'`;
        }
        if (!fields.contactNumber) {
            errors.contactNumber = "this field is required!";
        } else if (!REGX.MOBILE_NUMBER.test(fields.contactNumber)) {
            errors.contactNumber = "enter correct mobile number!";
        } else {
            contactNumber = `'${fields.contactNumber}'`;
        }
        if (!fields.state || fields.state == "" || fields.state == "-1") {
            errors.state = "this field is required!";
        } else {
            state = `'${fields.state}'`;
        }

        if (!fields.city) {
            errors.city = "this field is required!";
        } else {
            city = `'${fields.city}'`;
        }
        if (!fields.address) {
            errors.address = "this field is required!";
        } else {
            address = `'${fields.address}'`;
        }

        if (!fields.qualityOfServiceProvided) {
            errors.qualityOfServiceProvided = "this field is required!";
        } else {
            qualityOfServiceProvided = `'${fields.qualityOfServiceProvided}'`;
        }
        if (!fields.adherenceToDeliverySchedule) {
            errors.adherenceToDeliverySchedule = "this field is required!";
        } else {
            adherenceToDeliverySchedule = `'${fields.adherenceToDeliverySchedule}'`;
        }

        if (!fields.knowledgeOfRulesProcedures) {
            errors.knowledgeOfRulesProcedures = "this field is required!";
        } else {
            knowledgeOfRulesProcedures = `'${fields.knowledgeOfRulesProcedures}'`;
        }
        if (!fields.complaintHandlingResponseTime) {
            errors.complaintHandlingResponseTime = "this field is required!";
        } else {
            complaintHandlingResponseTime = `'${fields.complaintHandlingResponseTime}'`;
        }
        if (!fields.responseTimeOnQuaeriesByOurExcutives) {
            errors.responseTimeOnQuaeriesByOurExcutives = "this field is required!";
        } else {
            responseTimeOnQuaeriesByOurExcutives = `'${fields.responseTimeOnQuaeriesByOurExcutives}'`;
        }

        if (!fields.remark) {
            errors.remark = "this field is required!";
        } else {
            remark = `'${fields.remark}'`;
        }

        await runQuery(`call frontend_save_customer_feedback(${projectName}, ${workOrderNumber}, ${firstName}, ${lastName}, ${email}, ${contactNumber}, ${address},${state},${city}, ${qualityOfServiceProvided}, ${adherenceToDeliverySchedule}, ${knowledgeOfRulesProcedures}, ${complaintHandlingResponseTime}, ${responseTimeOnQuaeriesByOurExcutives},${remark})`);

        res.status(200).json({ status: "success", remark: 'Your feedback has been sent successfully.' });
        res.end();
        return;
    } catch (ex) {
        console.log(ex);
        res.status(500).json(ex);
        // res.status(500).json({status:"error",error:ex});
        res.end();
    }
};

const save_customer_complain = async (req, res, next) => {
    try {
        const fields = req.body;

        let firstName = null;
        let lastName = null;
        let email = null;
        let contactNumber = null;
        let message = null;
        let address = null;
        let state = null;
        let city = null;
        let pincode = null;


        if (!fields.firstName) {
            errors.firstName = "this field is required!";
        } else if (!REGX.FIRST_NAME.test(fields.firstName)) {
            errors.firstName = "only alphabets and whitespace is allowed!";
        } else {
            firstName = `'${fields.firstName}'`;
        }
        if (!fields.lastName) {
            errors.lastName = "this field is required!";
        } else if (!REGX.LAST_NAME.test(fields.lastName)) {
            errors.lastName = "only alphabets and whitespace is allowed!";
        } else {
            lastName = `'${fields.lastName}'`;
        }
        if (!fields.email) {
            errors.email = "this field is required!";
        } else if (!REGX.EMAIL.test(fields.email)) {
            errors.email = "enter correct email id!";
        } else {
            email = `'${fields.email}'`;
        }
        if (!fields.contactNumber) {
            errors.contactNumber = "this field is required!";
        } else if (!REGX.MOBILE_NUMBER.test(fields.contactNumber)) {
            errors.contactNumber = "enter correct mobile number!";
        } else {
            contactNumber = `'${fields.contactNumber}'`;
        }

        if (!fields.address) {
            errors.address = "this field is required!";
        } else {
            address = `'${fields.address}'`;
        }

        if (!fields.state || fields.state == "" || fields.state == "-1") {
            errors.state = "this field is required!";
        } else {
            state = `'${fields.state}'`;
        }

        if (!fields.city) {
            errors.city = "this field is required!";
        } else {
            city = `'${fields.city}'`;
        }
        if (!fields.pincode) {
            errors.pincode = "this field is required!";
        } else if (!REGX.PINCODE.test(fields.pincode)) {
            errors.pincode = "enter 6 digit pincode!";
        } else {
            pincode = `'${fields.pincode}'`;
        }

        if (!fields.message) {
            errors.message = "this field is required!";
        } else {
            message = `'${fields.message}'`;
        }


        await runQuery(`call frontend_save_customer_complain(${firstName}, ${lastName}, ${email}, ${contactNumber}, ${address},${state},${city},${pincode}, ${message})`);

        res.status(200).json({ status: "success", message: 'Your complaint has been sent successfully.' });
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
    address_list,
    details,
    apply,
    save_customer_feedback,
    save_customer_complain
};