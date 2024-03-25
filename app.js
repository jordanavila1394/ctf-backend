const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();

var corsOptions = {
  origin: "*", // use your actual domain name (or localhost), using * is not recommended
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Origin",
    "X-Requested-With",
    "Accept",
    "x-client-key",
    "x-client-token",
    "x-client-secret",
    "Authorization",
    "x-access-token",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// database
const db = require("./app/models");
const Role = db.role;

db.sequelize.sync();

// simple route
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to cms application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/role.routes")(app);
require("./app/routes/company.routes")(app);
require("./app/routes/place.routes")(app);
require("./app/routes/vehicle.routes")(app);
require("./app/routes/attendance.routes")(app);
require("./app/routes/deadlines.routes")(app);
require("./app/routes/upload.routes")(app);
require("./app/routes/download.routes")(app);
require("./app/routes/permission.routes")(app);
require("./app/routes/email.routes")(app);

//Cron jobs
const deadlinesController = require("./app/controllers/deadlines.controller");

cron.schedule(
  "22 23 * * *",
  async () => {
    try {
      // Chiamata al controller sendEmailsUnpaidDeadlines
      await deadlinesController.sendEmailsUnpaidDeadlines();
      console.log("Emails for unpaid deadlines sent successfully.");
    } catch (error) {
      console.error("Error sending emails for unpaid deadlines:", error);
    }
  },
  {
    timezone: "Europe/Rome", // Imposta il fuso orario italiano
  }
);
// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
