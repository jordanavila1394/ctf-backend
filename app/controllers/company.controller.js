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
