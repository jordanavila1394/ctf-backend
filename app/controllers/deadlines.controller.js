const db = require("../models");
const Deadlines = db.deadlines;
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
  })
    .then((entities) => {
      res.status(200).send(entities);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
