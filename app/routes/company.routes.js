const { verifySignUp } = require("../middleware");
const { authJwt } = require("../middleware");

const controller = require("../controllers/company.controller");
const verifyCompany = require("../middleware/verifyCompany");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/company/allCompanies",
    [authJwt.verifyToken],
    controller.allCompanies
  );

  app.get(
    "/api/company/getCompany/:id",
    [authJwt.verifyToken],
    controller.getCompany
  );

  app.post(
    "/api/company/createCompany",
    [authJwt.verifyToken, verifyCompany.checkDuplicateCompany],
    controller.createCompany
  );

  app.patch(
    "/api/company/patchCompany/:id",
    [authJwt.verifyToken],
    controller.patchCompany
  );

  app.delete(
    "/api/company/deleteCompany/:id",
    [authJwt.verifyToken],
    controller.deleteCompany
  );
};
