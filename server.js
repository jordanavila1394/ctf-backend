
const express = require('express');
const bodyParser = require('body-parser');


const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "http://localhost:4200", // use your actual domain name (or localhost), using * is not recommended
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

// parse requests of content-type - application/json
app.use(express.json());

app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

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
require("./app/routes/upload.routes")(app);
require("./app/routes/permission.routes")(app);
require("./app/routes/email.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
