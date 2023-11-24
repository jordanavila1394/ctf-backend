const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUser = (req, res, next) => {
  // Username
  User.findOne({
    where: {
      username: req.body.username,
    },
  }).then((user) => {
    if (user) {
      res.status(400).send({
        message: "Failed! Username is already in use!",
      });
      return;
    }

    // FISCAL CODE
    User.findOne({
      where: {
        fiscalCode: req.body.fiscalCode,
      },
    }).then((user) => {
      if (user) {
        res.status(400).send({
          message: "Errore! Il codice fiscale inserita è gia stata usato",
        });
        return;
      }

      // Email
      User.findOne({
        where: {
          email: req.body.email,
        },
      }).then((user) => {
        if (user) {
          res.status(400).send({
            message: "Errore! La mail inserita è gia stata usata",
          });
          return;
        }

        next();
      });
    });
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i],
        });
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUser: checkDuplicateUser,
  checkRolesExisted: checkRolesExisted,
};

module.exports = verifySignUp;
