// const nodemailer =require( 'nodemailer');
const sgMail = require('@sendgrid/mail')
const fs = require('fs');
const CONSTANTS = require('./Constants.js');
const path = require('path');
const AWS = require('aws-sdk');


const sendMailllll = async (fromEmail, fromName, tos, subject, html) => {

  AWS.config.update({ region: 'us-east-1' });

  const msg = {
    to: `${tos}`, // Change to your recipient
    from: `GRC India <${fromEmail}>`, // Change to your verified sender
    subject: `${subject}`,
    html: `${html}`,
  }

  var params = {
    Destination: { /* required */
      CcAddresses: [],
      ToAddresses: [
        `${tos}`,
        /* more items */
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
          Charset: "UTF-8",
          Data: `${html}`
        },
        Text: {
          Charset: "UTF-8",
          Data: ""
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `${subject}`
      }
    },
    Source: 'info@iskconayodhya.com', /* required */
    ReplyToAddresses: [
      'noreply@iskconayodhya.com',
      /* more items */
    ],
  };

  var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  sendPromise.then(
    function (data) {
      console.log(data.MessageId);
      return true;
    }).catch(
      function (err) {
        console.error(err, err.stack);
        return false;
      });

}

const sendMail = async (fromEmail, fromName, tos, subject, html) => {

  sgMail.setApiKey(CONSTANTS.SENDGRID_API_KEY)

  const msg = {
    to: `${tos}`, // Change to your recipient
    from: `GRC India <${fromEmail}>`, // Change to your verified sender
    subject: `${subject}`,
    html: `${html}`
  }

  sgMail
    .send(msg)
    .then((response) => {
      return true;
    })
    .catch((error) => {
      console.error(error)
      return false;
    })


}

const sendForeignContributionMail = async (fromEmail, fromName, tos, subject, html, attachments) => {

  sgMail.setApiKey(CONSTANTS.SENDGRID_API_KEY);

  // attachment = fs.readFileSync(pathToAttachment).toString("base64");

  let allAttachments = [];
  for (let i = 0; i < attachments.length; i++) {
    Object.keys(attachments[i]).map((key, index) => {
      let attachmentContent = fs.readFileSync(attachments[i][key].fileName).toString("base64");
      let attachmentFileName = key +"."+ attachments[i][key].fileName.split('.').pop();
      let mimetype = attachments[i][key].mimetype;
      allAttachments.push(
        {
          content: attachmentContent,
          filename: attachmentFileName,
          type: mimetype,
          disposition: "attachment"
        }
      );
    });
  }

  const msg = {
    to: `${tos}`, // Change to your recipient
    from: `GRC India <${fromEmail}>`, // Change to your verified sender
    subject: `${subject}`,
    html: `${html}`,
    attachments: allAttachments
  }

  sgMail
    .send(msg)
    .then((response) => {
      return true;
    })
    .catch((error) => {
      console.error(error)
      return false;
    })


}


const load_mail_template = async (templateName) => {
  let path_url = path.resolve(__dirname, '..');
  return new Promise((fulfill, reject) => {
    fs.readFile(`${path_url}/templates/${templateName}.html`, 'utf8', function (err, data) {
      if (err) {
        reject({ status: 'error', message: err });
      };
      fulfill(data);
    });
  });
}


module.exports = { sendMail, sendForeignContributionMail, load_mail_template };