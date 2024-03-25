const db = require("../models");
const Entity = db.entity;
const Op = db.Sequelize.Op;

exports.allDeadlines = (req, res) => {
  Entity.findAll({
    include: [
      {
        model: db.deadlines,
        as: "deadlines",
      },
    ],
    order: [["checkIn", "DESC"]],
  })
    .then((deadlines) => {
      res.status(200).send(deadlines);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
