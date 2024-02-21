const db = require("../models");

var moment = require("moment/moment");

const Document = db.userDocument;

exports.getDocumentsByUser = (req, res) => {
  const fiscalCode = req.body.fiscalCode;
  Document.findAll({
    where: {
      fiscalCode: fiscalCode,
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

exports.getWorkDocumentsByUser = (req, res) => {
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
