const db = require("../models");
const ROLES = db.ROLES;
const Company = db.company;

checkDuplicateCompany = (req, res, next) => {
  // VAT number
  Company.findOne({
    where: {
      vat: req.body.vat,
    },
  }).then((company) => {
    if (company) {
      res.status(409).send({
        message: "L'azienda è gia presente!",
      });
      return;
    }
    next();
  });
};

const verifyCompany = {
  checkDuplicateCompany: checkDuplicateCompany,
};

module.exports = verifyCompany;
