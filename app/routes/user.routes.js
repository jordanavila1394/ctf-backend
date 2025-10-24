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

  app.get(
    "/api/user/allCeosByCompany/:id",
    [authJwt.verifyToken],
    controller.allCeosByCompany
  );

  app.post("/api/user/allUsers", [authJwt.verifyToken], controller.allUsers);

  app.post(
    "/api/user/allUsersWithAttendances",
    [authJwt.verifyToken],
    controller.allUsersWithAttendances
  );

  app.get("/api/user/getUser/:id", [authJwt.verifyToken], controller.getUser);

  app.post(
    "/api/user/getUserByFiscalCode",
    [authJwt.verifyToken],
    controller.getUserByFiscalCode
  );


  app.post(
    "/api/user/createUser",
    [authJwt.verifyToken, verifySignUp.checkDuplicateUser],
    controller.createUser
  );

  app.post(
    "/api/user/checkIfExistUser",
    [authJwt.verifyToken],
    controller.checkIfExistUser
  );

  app.patch(
    "/api/user/patchUser/:id",
    [authJwt.verifyToken],
    controller.patchUser
  );

  app.patch(
    "/api/user/saveProfileUser",
    [authJwt.verifyToken],
    controller.saveProfileUser
  );

  app.patch(
    "/api/user/saveNewPassword",
    [authJwt.verifyToken],
    controller.saveNewPassword
  );

  app.delete(
    "/api/user/deleteUser/:id",
    [authJwt.verifyToken],
    controller.deleteUser
  );

  app.put("/api/user/updateUserEmail/:id", [authJwt.verifyToken], controller.updateUserEmail);


  app.get("/api/user/getAllAssociatedClients", [authJwt.verifyToken], controller.getAllAssociatedClients);
  app.get("/api/user/getAllAssociatedBranchs", [authJwt.verifyToken], controller.getAllAssociatedBranchs);

};
