const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/deadlines.controller");

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
};
