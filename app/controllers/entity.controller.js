const db = require("../models");
const Entity = db.entity;
const Company = db.company;
exports.allEntities = (req, res) => {
  const idCompany = req.body.idCompany;
  if (idCompany > 0) {
    Entity.findAll({
      include: [
        {
          model: Company,
          as: "company",
          where: {
            id: idCompany,
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    })
      .then((entities) => {
        res.status(200).send(entities);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } else {
    Entity.findAll({
      include: [
        {
          model: Company,
          as: "company",
        },
      ],
      order: [["createdAt", "DESC"]],
    })
      .then((entities) => {
        res.status(200).send(entities);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
};
