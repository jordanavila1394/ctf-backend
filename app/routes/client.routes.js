const { authJwt } = require("../middleware");
const controller = require("../controllers/client.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/client/getAllClients",
    [authJwt.verifyToken],
    controller.getAllClients
  );

  app.get(
    "/api/client/getClient/:id",
    [authJwt.verifyToken],
    controller.getClient
  );

  app.post(
    "/api/client/createClient",
    [authJwt.verifyToken],
    controller.createClient
  );

  app.patch(
    "/api/client/updateClient/:id",
    [authJwt.verifyToken],
    controller.updateClient
  );

  app.delete(
    "/api/client/deleteClient/:id",
    [authJwt.verifyToken],
    controller.deleteClient
  );
};
