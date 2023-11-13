const db = require("../models");
const User = db.user;
const Op = db.Sequelize.Op;
exports.allCeos = (req, res) => {
  User.findAll({
    include: [
      {
        model: db.role,
        where: [{ id: 4 }], // Where Role is CEO, id 4
        attributes: ["id", "name"],
      },
    ],
    attributes: ["id", "name", "surname"],
  })
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
