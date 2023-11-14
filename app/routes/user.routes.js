const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // app.get("/api/test/all", [authJwt.verifyToken], controller.allAccess);

  app.get("/api/user/allCeos", [authJwt.verifyToken], controller.allCeos);

  app.get("/api/user/allUsers", [authJwt.verifyToken], controller.allUsers);

  app.get("/api/user/getUser/:id", [authJwt.verifyToken], controller.getUser);

  app.post(
    "/api/user/createUser",
    [authJwt.verifyToken, verifySignUp.checkDuplicateUsernameOrEmail],
    controller.createUser
  );

  app.patch(
    "/api/user/patchUser/:id",
    [authJwt.verifyToken],
    controller.patchUser
  );

  app.delete(
    "/api/user/deleteUser/:id",
    [authJwt.verifyToken],
    controller.deleteUser
  );
};
