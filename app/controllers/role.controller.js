const db = require("../models");
const Role = db.role;
const Op = db.Sequelize.Op;

exports.allRoles = (req, res) => {
  Role.findAll({
    where: { id: { [Op.not]: [3] } }, //Exclude roles admin
  })
    .then((roles) => {
      res.status(200).send(roles);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
