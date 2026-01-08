const { authJwt } = require("../middleware");
const controller = require("../controllers/migration.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Endpoint per debuggare i dati prima della migrazione
  app.get(
    "/api/migration/debug-client-branch",
    [authJwt.verifyToken],
    controller.debugMigrationData
  );

  // Endpoint per eseguire la migrazione
  app.post(
    "/api/migration/run-client-branch",
    [authJwt.verifyToken],
    controller.runMigration
  );
};
