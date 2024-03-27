const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "avila@ctfitalia.com",
    pass: "jltp orxo koae bavi",
  },
});

// Load the HTML and CSS template
const cssFilePath = path.join(__dirname, "../templates/style.css");

const styles = fs.readFileSync(cssFilePath, "utf-8");
const cid = "imagelogo@cid";

exports.sendEmail = (req, res) => {
  const { recipient, subject, message } = req.body;
  const htmlDefaultTemplate = fs.readFileSync(
    path.join(__dirname, "../templates/defaultEmail.html"),
    "utf-8"
  );
  let htmlContent = htmlDefaultTemplate.replace("{{imageCid}}", cid);
  htmlContent = htmlContent.replace("{{message}}", message);

  const mailOptions = {
    from: "info@ctfitalia.com",
    to: recipient,
    subject: subject,
    html: htmlContent,
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../templates/logo.png"),
        cid: cid, //same cid value as in the html img src
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (info.response) res.status(200).send("Email inviata: " + info.response);
  });
};
