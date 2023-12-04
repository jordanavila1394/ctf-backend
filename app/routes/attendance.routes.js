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

  app.post(
    "/api/attendance/allAttendances",
    [authJwt.verifyToken],
    controller.allAttendances
  );

  app.post(
    "/api/attendance/getAttendance",
    [authJwt.verifyToken],
    controller.getAttendance
  );

  app.post(
    "/api/attendance/getDataAttendances",
    [authJwt.verifyToken],
    controller.getDataAttendances
  );

  
  app.post(
    "/api/attendance/getMyAttendances",
    [authJwt.verifyToken],
    controller.getMyAttendances
  );

  app.post(
    "/api/attendance/checkInAttendance",
    [authJwt.verifyToken],
    controller.checkInAttendance
  );

  app.post(
    "/api/attendance/checkOutAttendance",
    [authJwt.verifyToken],
    controller.checkOutAttendance
  );
  
  
};
