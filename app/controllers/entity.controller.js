const db = require("../models");
const Entity = db.entity;
const Company = db.company;
const Deadline = db.deadlines;
const EntityDocument = db.entityDocument;
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
    identifier: req.body.identifier ? req.body.identifier : "",
    payer: req.body.payer,
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

  // First, delete the entity's documents
  EntityDocument.destroy({
    where: { entityId: entityId },
  })
    .then(() => {
      // Then, delete the entity and deadlines
      Entity.destroy({
        where: { id: entityId },
      })
        .then(() => {
          // Delete deadlines associated with the entity
          Deadline.destroy({
            where: { entityId: entityId },
          })
            .then(() => {
              res.status(201).send({
                message: "Entity, deadlines e documenti associati eliminati con successo!",
              });
            })
            .catch((err) => {
              res.status(500).send({ message: err.message });
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


exports.updatePayerEntity = (req, res) => {
  const entityId = req.params.id;

  Entity.update({
    payer: req.body.payer ? req.body.payer : ""
  }, {
    where: { id: entityId },
  })
    .then((entity) => {
      res.status(200).send({
        message: "Entity updated successfully!",
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};