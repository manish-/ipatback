const BASE_URL = 'https://api.grc-india.com/';

const CONSTANTS = {
    PORT: 5000,
    JWT_ACCESS_TOKEN_KEY: 'grcindiareactnodenvdtk',
    JWT_REFRESH_TOKEN_KEY: 'grcindiareactnodenvdrtk',
    SENDGRID_API_KEY: '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',
    BASE_FRONTEND_URL: 'https://www.grc-india.com/',
    BASE_URL: BASE_URL,
    BASE_UPLOADS_URL: `${BASE_URL}uploads/`,
    BASE_UPLOADS_PATH: './public/uploads/',

    MAIL_FROM: 'purushottam.sharma@newvisiondigital.co',
    // MAIL_TO:'info@mysehat.in',
    MAIL_TO_ADMIN: 'purushottam.sharma@newvisiondigital.co',
    // MAIL_TO_ADMIN: 'mohd.shaan@newvisiondigital.co',
    PAN_REQUIRED_AMOUNT: 50000,
    PAYMENT_STATUS_API_URL: `https://api.razorpay.com/v1/orders/___order_id___/payments`,
    TEMPLATES_PATH:{
        G80:'templates/payment80g.html',
        G80_TEMP:'tmp/80g'
    },
    TEMP_PATH:{
        EXPORT:'tmp/adminExports'
    }

}


module.exports = CONSTANTS;
