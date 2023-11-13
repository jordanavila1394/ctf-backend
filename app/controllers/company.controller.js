const db = require("../models");
const Company = db.company;
const Op = db.Sequelize.Op;

exports.allCompanies = (req, res) => {
  Company.findAll({
    include: [{ model: db.user, attributes: ["name", "surname"] }],
  })
    .then((companies) => {
      res.status(200).send(companies);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
exports.createCompany = (req, res) => {
  // Save User to Database
  Company.create({
    name: req.body.name,
    vat: req.body.vat,
    reaNumber: req.body.reaNumber,
    legalForm: req.body.legalForm,
    registeredOffice: req.body.registeredOffice,
    headOffice: req.body.headOffice,
    phone: req.body.phone,
    email: req.body.email,
    pec: req.body.pec,
    website: req.body.website,
    description: req.body.description,
    status: req.body.status,
    userId: req.body.userId,
  })
    .then((company) => {
      res.status(201).send({ message: "Azienda aggiunta con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
