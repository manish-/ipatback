const jwt = require('jsonwebtoken');
const CONSTANTS = require('./Constants.js');

const generateToken = (data, key, expiresIn = '1hr') => {
    const token = jwt.sign({
        data: data
    }, key, { expiresIn: expiresIn });

    return token;
};

const verifyToken = (req, res, next) => {
    const authHeader = String(req.headers['authorization'] || '');

    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7, authHeader.length);
        jwt.verify(token, CONSTANTS.JWT_ACCESS_TOKEN_KEY, function (err, decoded) {
            if (err) {
                res.status(500).json({ status: "error", message: "your session has been expired. please login again!", tokenExpired: true });
                res.end();
                return;
            }
            const userId = decoded.data.userId;
            req.userId = userId;
            next();
        });
    } else {
        res.status(500).json({ status: "error", message: "Access token is required!!" });
        res.end();
        return;
    }
};

const refreashToken = (req, res, next) => {
    jwt.verify(token, CONSTANTS.JWT_REFRESH_TOKEN_KEY, function (err, decoded) {
        if (err) {
            console.log('err');
            console.log(err);
        }
        console.log('success');
        console.log(decoded);
    });
};

const verifyOptionalToken = (req, res, next) => {
    const authHeader = String(req.headers['authorization'] || '');
    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7, authHeader.length);
        console.log("token",token);
        if (!token || token=='null') {
            req.userId = null;
            next();
        } else {
            jwt.verify(token, CONSTANTS.JWT_ACCESS_TOKEN_KEY, function (err, decoded) {
                if (err) {
                    res.status(500).json({ status: "error", message: "your session has been expired. please login again!!!!", tokenExpired: true });
                    res.end();
                    return;
                }
                const userId = decoded.data.userId;
                req.userId = userId;
                next();
            });
        }
    } else {
        req.userId = null;
        next();
    }
};


module.exports = { generateToken, verifyToken, refreashToken, verifyOptionalToken };