const { authJwt } = require("../middleware");
const controller = require("../controllers/branch.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/branch/getAllBranches",
    [authJwt.verifyToken],
    controller.getAllBranches
  );

  app.get(
    "/api/branch/getBranch/:id",
    [authJwt.verifyToken],
    controller.getBranch
  );

  app.post(
    "/api/branch/createBranch",
    [authJwt.verifyToken],
    controller.createBranch
  );

  app.patch(
    "/api/branch/updateBranch/:id",
    [authJwt.verifyToken],
    controller.updateBranch
  );

  app.delete(
    "/api/branch/deleteBranch/:id",
    [authJwt.verifyToken],
    controller.deleteBranch
  );
};
