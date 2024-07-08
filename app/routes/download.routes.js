const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/download.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/download/getDocumentsByUser",
    [authJwt.verifyToken],
    controller.getDocumentsByUser
  );

  app.post(
    "/api/download/getCedoliniDocumentsByUser",
    [authJwt.verifyToken],
    controller.getCedoliniDocumentsByUser
  );
  app.post(
    "/api/download/getCUDDocumentsByUser",
    [authJwt.verifyToken],
    controller.getCUDDocumentsByUser
  );
  app.post(
    "/api/download/getDocumentsExpiringSoonByUser",
    [authJwt.verifyToken],
    controller.getDocumentsExpiringSoonByUser
  );
};
