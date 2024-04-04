const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/deadlines.controller");

const multer = require("multer");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/deadlines/allDeadlines",
    [authJwt.verifyToken],
    controller.allDeadlines
  );
  app.post(
    "/api/deadlines/monthlySummary",
    [authJwt.verifyToken],
    controller.monthlySummary
  );
  app.post(
    "/api/deadlines/changeStatusDeadline",
    [authJwt.verifyToken],
    controller.changeStatusDeadline
  );
  app.post(
    "/api/deadlines/changePaymentDateDeadline",
    [authJwt.verifyToken],
    controller.changePaymentDateDeadline
  );
  app.post(
    "/api/deadlines/uploadDeadlinesExcel",
    upload.single("file"),
    [authJwt.verifyToken],
    controller.uploadDeadlinesExcel
  );
};
