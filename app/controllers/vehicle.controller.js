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
          where: { status: true }, 
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
  } else {
    Vehicle.findAll({
      include: [
        {
          model: db.user,
          as: "user",
          where: { status: true }, 
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

exports.createVehicle = (req, res) => {
  // Save Vehicle to Database
  Vehicle.create({
    licensePlate: req.body.licensePlate,
    tipology: req.body.tipology,
    model: req.body.model,
    rentalType: req.body.rentalType,
    driverType: req.body.driverType,
  })
    .then((vehicle) => {
      res.status(201).send({ message: "Veicolo aggiunto con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getVehicleInfoByPlate = (req, res) => {
  const plate = req.params.plate;

  Vehicle.findOne({
    include: [
      { model: User, as: "user" },
      { model: Company, as: "company" },
    ],
    where: db.Sequelize.where(
      db.Sequelize.fn('LOWER', db.Sequelize.col('licensePlate')),
      plate.toLowerCase()
    ),
  })
    .then((vehicle) => {
      if (!vehicle) {
        return res.status(404).send({ message: "Veicolo non trovato." });
      }
      res.status(200).send(vehicle);
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};