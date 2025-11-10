const db = require("../models");
const Company = db.company;
const User = db.user;
const Op = db.Sequelize.Op;

exports.allCompanies = (req, res) => {
  Company.findAll({
    include: [
      {
        model: db.user,
        attributes: ["id", "name", "surname"],
        as: "users",
        where: { status: true }, 
        include: [
          {
            model: db.role,
            as: "roles",
          },
        ],
      },
      {
        model: db.place,
        as: "places",
      },
    ],
    order: [
      ["updatedAt", "DESC"],
      ["id", "ASC"],
    ],
  })
    .then((companies) => {
      res.status(200).send(companies);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.createCompany = (req, res) => {
  // Save Company to Database
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
    ceoId: req.body.ceoId,
  })
    .then((company) => {
      res.status(201).send({ message: "Azienda aggiunta con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.deleteCompany = (req, res) => {
  // Delete company
  Company.destroy({
    where: { id: req.params.id },
  })
    .then((company) => {
      res.status(201).send({ message: "Azienda eliminata con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getCompany = (req, res) => {
  // Get company
  Company.findOne({
    where: { id: req.params.id },
  })
    .then((company) => {
      if (company) {
        res.status(200).send(company);
      } else {
        res.status(500).send({ message: "Azienda non trovata" });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.patchCompany = (req, res) => {
  // Save Company to Database
  Company.update(
    {
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
      ceoId: req.body.ceoId,
    },
    { where: { id: req.params.id } }
  )
    .then((company) => {
      res.status(201).send({
        message: "Azienda modificata con successo!",
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
