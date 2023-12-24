const db = require("../models");
const User = db.user;
const Company = db.company;
const Vehicle = db.vehicle;

const Op = db.Sequelize.Op;

exports.allVehicles = (req, res) => {

  const idCompany = req.body.idCompany;
  if (idCompany > 0) {

  Vehicle.findAll({
    include: [
      {
        model: db.user,
        as: "user",
      },
      {
        model: db.company,
        as: "company",
      },
    ],
    where: {
      companyId: idCompany,
    },
  })
    .then((vehicles) => {
      res.status(200).send(vehicles);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
  } else{
    Vehicle.findAll({
      include: [
        {
          model: db.user,
          as: "user",
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
  }
};
