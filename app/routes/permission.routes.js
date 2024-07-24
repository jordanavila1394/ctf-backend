const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controllers/permission.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/permission/getMyPermissions",
    [authJwt.verifyToken],
    controller.getMyPermissions
  );

  app.post(
    "/api/permission/getMyMedicalLeave",
    [authJwt.verifyToken],
    controller.getMyMedicalLeave
  );

  app.post(
    "/api/permission/getPermissionById",
    [authJwt.verifyToken],
    controller.getPermissionById
  );

  app.post(
    "/api/permission/addProtocolNumberPermission",
    [authJwt.verifyToken],
    controller.addProtocolNumberPermission
  );

  app.post(
    "/api/permission/createPermission",
    [authJwt.verifyToken],
    controller.createPermission
  );

  app.post(
    "/api/permission/allPermissions",
    [authJwt.verifyToken],
    controller.allPermissions
  );

  app.post(
    "/api/permission/permissionsByClient",
    [authJwt.verifyToken],
    controller.permissionsByClient
  );

  app.post(
    "/api/permission/approvePermission",
    [authJwt.verifyToken],
    controller.approvePermission
  );

  app.post(
    "/api/permission/rejectPermission",
    [authJwt.verifyToken],
    controller.rejectPermission
  );
  app.post(
    "/api/permission/cleanPermissions",
    [authJwt.verifyToken],
    controller.cleanPermissions
  );

};
