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
        [Op.notIn]: ["cedolino", "cud"], // Exclude documents with category 'cedolino'
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

exports.getDocumentsExpiringSoonByUser = (req, res) => {
  const userId = req.body.userId;

  if (!userId) {
    return res.status(400).send({ message: "User ID is required" });
  }

  const expireThresholdDate = moment().add(5, 'days').toDate();

  console.log("expireThresholdDate", expireThresholdDate);
  Document.findAll({
    where: {
      userId: userId,
      expireDate: {
        [Op.lte]: expireThresholdDate,
      },
    },
    order: [['expireDate', 'ASC']],
  })
    .then((documents) => {
      res.status(200).send(documents);
    })
    .catch((err) => {
      console.error("Error fetching documents:", err);
      res.status(500).send({ message: "An error occurred while retrieving documents." });
    });
};