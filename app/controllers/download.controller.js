const db = require("../models");

var moment = require("moment/moment");

const Document = db.userDocument;
const Op = db.Sequelize.Op;

exports.getDocumentsByUser = (req, res) => {
  const fiscalCode = req.body.fiscalCode;
  Document.findAll({
    where: {
      fiscalCode: fiscalCode,
      category: {
        [Op.ne]: "cedolino", // Exclude documents with category 'cedolino'
      },
    },
    order: ["category"],
  })
    .then((documents) => {
      res.status(200).send(documents);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getCedoliniDocumentsByUser = (req, res) => {
  const fiscalCode = req.body.fiscalCode;
  Document.findAll({
    where: {
      fiscalCode: fiscalCode,
      category: "cedolino",
    },
  })
    .then((documents) => {
      res.status(200).send(documents);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
exports.getCUDDocumentsByUser = (req, res) => {
  const fiscalCode = req.body.fiscalCode;
  Document.findAll({
    where: {
      fiscalCode: fiscalCode,
      category: "cud",
    },
  })
    .then((documents) => {
      res.status(200).send(documents);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};