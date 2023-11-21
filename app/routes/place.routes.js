const { authJwt } = require("../middleware");
const controller = require("../controllers/place.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/place/getPlacesByCompany/:id",
    [authJwt.verifyToken],
    controller.getPlacesByCompany
  );
  app.post(
    "/api/place/createPlace",
    [authJwt.verifyToken],
    controller.createPlace
  );
};
