const db = require("../models");
const User = db.user;
const Company = db.company;
const Vehicle = db.vehicle;

const Op = db.Sequelize.Op;

exports.allVehicles = (req, res) => {
  Vehicle.findAll({
    include: [
      {
        model: db.user,
        as: "driver",
      },
      {
        model: db.company,
        as: "company",
      },
    ],
  })
    .then((vehicles) => {
      res.status(200).send(vehicles);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
