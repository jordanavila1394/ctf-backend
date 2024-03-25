const db = require("../models");
const Deadlines = db.deadlines;
const Op = db.Sequelize.Op;

exports.allDeadlines = (req, res) => {
  Deadlines.findAll({
    include: [
      {
        model: db.entity,
        as: "entity",
      },
    ],
  })
    .then((deadlines) => {
      res.status(200).send(deadlines);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
