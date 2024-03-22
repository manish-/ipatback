const runQuery = require('../../../utils/DatabaseCon.js');
const REGX = require('../../../utils/Regx.js');
const { generateToken } = require('../../../utils/AuthenticationToken.js');
// const { sendMail, load_mail_template } = require('../../../utils/Mails.js');
const jwt = require('jsonwebtoken');
const { moveFile } = require('../../../utils/FileUploads.js');
const CONSTANTS = require('../../../utils/Constants.js');
const { SQLFormatDate,slugify } = require('../../../utils/utilsFunctions.js');

const login = async (req, res, next) => {

    try {
        const fields = req.body;
        let errors = {};
        let username = null;
        let password = null;
        let userType = `'admin'`;
        // let user_token = null;

        if (!fields.username) {
            errors.username = "this field is required!";
        } else {
            username = `'${fields.username}'`;
        }

        if (!fields.password) {
            errors.password = "this field is required!";
        } else {
            password = `'${fields.password}'`;
        }
        /*
        if (!fields.userType) {
            errors.userType = "this field is required!";
        } else {
            userType = `'${fields.userType}'`;
        }
        */
/*
        if (fields.user_token) {
            user_token = `"${fields.user_token}"`;
        }
*/
        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }

        const result = await runQuery(`call backend_login(${username},${password},${userType})`);
        const user = result[0][0];
        if (user.user_status !== 'active') {
            res.status(500).json({ status: "error", message: `user (${fields.username}) is ${user.user_status}` });
            res.end();
            return;
        }
        const accessToken = generateToken({ userId: user.id }, CONSTANTS.JWT_ACCESS_TOKEN_KEY, "3hr");
        const refreshToken = generateToken({ userId: user.id }, CONSTANTS.JWT_REFRESH_TOKEN_KEY, "60 days");

        res.status(200).json({ status: "success", message: 'logged in successfully', accessToken: accessToken, refreshToken: refreshToken });
        res.end();

    } catch (ex) {

        res.status(500).json(ex);
        res.end();
    }
};

const refreash_token = async (req, res, next) => {

    try {
        const authHeader = String(req.headers['authorization'] || '');
        if (authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7, authHeader.length);
            jwt.verify(token, CONSTANTS.JWT_REFRESH_TOKEN_KEY, function (err, decoded) {
                if (err) {
                    res.status(500).json({ status: "error", message: "token has been expired!" });
                    res.end();
                }

                const userId = decoded.data.userId;
                const accessToken = generateToken({ userId: userId }, CONSTANTS.JWT_ACCESS_TOKEN_KEY, "3hr");
                // const refreshToken = generateToken({userId:user.id},CONSTANTS.JWT_REFRESH_TOKEN_KEY,"60 days");
                res.status(200).json({ status: "success", message: 'token has been re-created', accessToken: accessToken });
                res.end();
            });
        } else {
            res.status(500).json({ status: "error", message: "refreash token is required!" });
            res.end();
        }
    } catch (ex) {

        res.status(500).json(ex);
        res.end();
    }
};

const verify_token = async (req, res, next) => {

    try {
        res.status(200).json({ status: "success", message: 'continue your session' });
        res.end();
    } catch (ex) {
        res.status(500).json(ex);
        res.end();
    }
};

const details = async (req, res, next) => {
    try {
        
        const userId = req.userId;

        let result = await runQuery(`call backend_user_profile_fetch(${userId})`);

        let details = result[0][0];

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

const update_password = async (req, res, next) => {
    try {
        
        const userId = req.userId;
        const fields = req.body;

        let errors = {};
        let currentPassword = null;
        let newPassword = null;
        
        if (!fields.currentPassword) {
            errors.currentPassword = "this field is required!";
        } else {
            currentPassword = `'${fields.currentPassword}'`;
        }
        if (!fields.newPassword) {
            errors.newPassword = "this field is required!";
        } else {
            newPassword = `'${fields.newPassword}'`;
        }
        
        if (Object.keys(errors).length > 0) {
            res.status(500).json({ status: "error", errors: errors });
            res.end();
            return;
        }


        await runQuery(`call backend_user_profile_update_password(${userId},${currentPassword},${newPassword})`);

        res.status(200).json({ status: "success", message:'Profile password has been changed!' });
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
    login,
    refreash_token,
    verify_token,
    details,
    update_password
};