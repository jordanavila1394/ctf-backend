const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/attendance.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/attendance/allAttendances",
    [authJwt.verifyToken],
    controller.allAttendances
  );
  app.get(
    "/api/attendance/getDataAttendances",
    [authJwt.verifyToken],
    controller.getDataAttendances
  );
};
