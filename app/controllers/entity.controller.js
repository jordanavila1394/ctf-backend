const db = require("../models");
const Entity = db.entity;
const Company = db.company;
const Deadline = db.deadlines;
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

exports.createEntity = (req, res) => {
  // Save User to Database
  Entity.create({
    companyId: req.body.companyId,
    name: req.body.name,
    identifier: req.body.identifier,
  })
    .then((entity) => {
      res.status(201).send({ message: "Ente aggiunto con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.deleteEntity = (req, res) => {
  const entityId = req.params.id;
  // Delete company
  Entity.destroy({
    where: { id: entityId },
  })
    .then((entity) => {
      // Delete deadlines associated with the entity
      Deadline.destroy({
        where: { entityId: entityId },
      })
        .then((numDeleted) => {
          res.status(201).send({
            message: "Entity e relative scadenze eliminate con successo!",
          });
        })
        .catch((err) => {
          res.status(500).send({ message: err.message });
        });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
