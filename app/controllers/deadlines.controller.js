const db = require("../models");
const Entity = db.entity;
const Deadlines = db.deadlines;

const Op = db.Sequelize.Op;

exports.allDeadlines = (req, res) => {
  Entity.findAll({
    include: [
      {
        model: Deadlines,
        as: "deadlines",
      },
    ],
  })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
