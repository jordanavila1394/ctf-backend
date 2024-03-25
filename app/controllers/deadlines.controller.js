const db = require("../models");
const Entity = db.entity;
const Deadlines = db.deadlines;
const Company = db.company;

const Op = db.Sequelize.Op;
var moment = require("moment/moment");

exports.allDeadlines = (req, res) => {
  const idCompany = req.body.idCompany;
  const startOfMonth = moment()
    .set({ year: req.body.year, month: req.body.month })
    .startOf("month")
    .format("YYYY-MM-DD 00:00");
  const endOfMonth = moment()
    .set({ year: req.body.year, month: req.body.month })
    .endOf("month")
    .format("YYYY-MM-DD 23:59");
  if (idCompany > 0) {
    Entity.findAll({
      include: [
        {
          model: Deadlines,
          as: "deadlines",
          where: {
            companyId: idCompany,
            expireDate: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
        },
        {
          model: Company,
          as: "company",
        },
      ],
    })
      .then((data) => {
        res.status(200).send(data);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } else {
    Entity.findAll({
      include: [
        {
          model: Deadlines,
          as: "deadlines",
          where: {
            expireDate: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
        },
        {
          model: Company,
          as: "company",
        },
      ],
    })
      .then((data) => {
        res.status(200).send(data);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
};
