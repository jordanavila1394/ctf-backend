const { authJwt } = require("../middleware");
const controller = require("../controllers/entity.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/entity/allEntities",
    [authJwt.verifyToken],
    controller.allEntities
  );

  app.post(
    "/api/entity/createEntity",
    [authJwt.verifyToken],
    controller.createEntity
  );

  app.delete(
    "/api/entity/deleteEntity/:id",
    [authJwt.verifyToken],
    controller.deleteEntity
  );
  
  app.put(
    "/api/entity/updateEntity/:id",
    [authJwt.verifyToken],
    controller.updateEntity
  );
};
