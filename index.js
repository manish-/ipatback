const express = require('express');
const cors = require('cors');
const app = express();
const CONSTANTS = require("./utils/Constants.js");
const AppErrors = require("./utils/AppErrors.js");
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
//const cron = require('node-cron');

const runQuery = require('./utils/DatabaseCon.js');

const { json } = require('body-parser');

const port = CONSTANTS.PORT || 5000;

app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));


app.use(express.static('public'));

const v1_backend_utils_routes = require('./routes/v1/backend/utils.js');
const v1_backend_auth_routes = require('./routes/v1/backend/auth.js');
const v1_backend_about_us_routes = require('./routes/v1/backend/about_us.js');
const v1_backend_projects_routes = require('./routes/v1/backend/projects.js');
const v1_backend_projects_type_routes = require('./routes/v1/backend/projects_type.js');
const v1_backend_services_routes = require('./routes/v1/backend/services.js');
const v1_backend_clientele_routes = require('./routes/v1/backend/clientele.js');
const v1_backend_laboratory_routes = require('./routes/v1/backend/laboratory.js');
const v1_backend_career_routes = require('./routes/v1/backend/career.js');
const v1_backend_downloads_routes = require('./routes/v1/backend/downloads.js');
const v1_backend_accreditations_routes = require('./routes/v1/backend/accreditations');
const v1_backend_contact_us_routes = require('./routes/v1/backend/contact_us.js');
const v1_backend_news_routes = require('./routes/v1/backend/news.js');
const v1_backend_seminars_routes = require('./routes/v1/backend/seminars.js');
const v1_backend_banners_routes = require('./routes/v1/backend/banners.js');
const v1_backend_events_routes = require('./routes/v1/backend/events.js');
const v1_backend_faqs_routes = require('./routes/v1/backend/faqs.js');
const v1_backend_new_initiatives_routes = require('./routes/v1/backend/new_initiatives.js');

const v1_frontend_utils_routes = require('./routes/v1/frontend/utils.js');
const v1_frontend_about_us_routes = require('./routes/v1/frontend/about_us.js');
const v1_frontend_services_routes = require('./routes/v1/frontend/services.js');
const v1_frontend_projects_routes = require('./routes/v1/frontend/projects.js');
const v1_frontend_clientele_routes = require('./routes/v1/frontend/clientele.js');
const v1_frontend_laboratory_routes = require('./routes/v1/frontend/laboratory.js');
const v1_frontend_career_routes = require('./routes/v1/frontend/career.js');
const v1_frontend_downloads_routes = require('./routes/v1/frontend/downloads.js');
const v1_frontend_contact_us_routes = require('./routes/v1/frontend/contact_us.js');
const v1_frontend_accreditations_routes = require('./routes/v1/frontend/accreditations.js');
const v1_frontend_news_routes = require('./routes/v1/frontend/news.js');
const v1_frontend_seminars_routes = require('./routes/v1/frontend/seminars.js');
const v1_frontend_faqs_routes = require('./routes/v1/frontend/faqs.js');
const v1_frontend_new_initiatives_routes = require('./routes/v1/frontend/new_initiatives.js');


app.use('/api/v1/backend/utils', v1_backend_utils_routes);
app.use('/api/v1/backend/auth', v1_backend_auth_routes);
app.use('/api/v1/backend/about-us', v1_backend_about_us_routes);
app.use('/api/v1/backend/project', v1_backend_projects_routes);
app.use('/api/v1/backend/project-type', v1_backend_projects_type_routes);
app.use('/api/v1/backend/service', v1_backend_services_routes);
app.use('/api/v1/backend/clientele', v1_backend_clientele_routes);
app.use('/api/v1/backend/laboratory', v1_backend_laboratory_routes);
app.use('/api/v1/backend/career', v1_backend_career_routes);
app.use('/api/v1/backend/downloads', v1_backend_downloads_routes);
app.use('/api/v1/backend/accreditations', v1_backend_accreditations_routes);
app.use('/api/v1/backend/contact-us', v1_backend_contact_us_routes);
app.use('/api/v1/backend/news', v1_backend_news_routes);
app.use('/api/v1/backend/seminars', v1_backend_seminars_routes);
app.use('/api/v1/backend/banners', v1_backend_banners_routes);
app.use('/api/v1/backend/events', v1_backend_events_routes);
app.use('/api/v1/backend/faqs', v1_backend_faqs_routes);
app.use('/api/v1/backend/new-initiatives', v1_backend_new_initiatives_routes);

app.use('/api/v1/frontend/utils', v1_frontend_utils_routes);
app.use('/api/v1/frontend/about-us', v1_frontend_about_us_routes);
app.use('/api/v1/frontend/service', v1_frontend_services_routes);
app.use('/api/v1/frontend/project', v1_frontend_projects_routes);
app.use('/api/v1/frontend/clientele', v1_frontend_clientele_routes);
app.use('/api/v1/frontend/laboratory', v1_frontend_laboratory_routes);
app.use('/api/v1/frontend/career', v1_frontend_career_routes);
app.use('/api/v1/frontend/downloads', v1_frontend_downloads_routes);
app.use('/api/v1/frontend/contact-us', v1_frontend_contact_us_routes);
app.use('/api/v1/frontend/accreditations', v1_frontend_accreditations_routes);
app.use('/api/v1/frontend/news', v1_frontend_news_routes);
app.use('/api/v1/frontend/seminars', v1_frontend_seminars_routes);
app.use('/api/v1/frontend/faqs', v1_frontend_faqs_routes);
app.use('/api/v1/frontend/new-initiatives', v1_frontend_new_initiatives_routes);


app.get("/", (req, res, next) => {
    res.json({
        "API": "GRC INDIA API",
        "Organization": "New Vision Digital",
        "Website": "https://www.newvisiondigital.co/",
        "Email": "hello@newvisiondigital.co",
        "Mobile": "+971 569977333",
        "Developed By": {
            "Name": "Purushottam Sharma",
            "Mobile": "+91 8791242412"
        }

    });
    res.end();
});

app.all("*", (req, res, next) => {
    next(new AppErrors(`Can't found ${req.originalUrl}!`, 404));
});


app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
});

app.listen();


// app.listen(port,async(req,res)=>{
//     console.log(`MySehatApp running at ${port}`);
// });