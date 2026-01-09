const db = require("../models");
const Branch = db.branch;

// Get all branches
exports.getAllBranches = (req, res) => {
  Branch.findAll({
    include: [
      {
        model: db.user,
        as: "users",
        attributes: [],
      }
    ],
    attributes: {
      include: [
        [db.sequelize.fn('COUNT', db.sequelize.col('users.id')), 'userCount']
      ]
    },
    group: ['branches.id'],
    order: [['name', 'ASC']]
  })
    .then((branches) => {
      res.status(200).send(branches);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Get a single branch by ID
exports.getBranch = (req, res) => {
  Branch.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: db.user,
        as: "users",
        attributes: { exclude: ["password"] },
      }
    ]
  })
    .then((branch) => {
      if (branch) {
        res.status(200).send(branch);
      } else {
        res.status(404).send({ message: "Branch non trovato" });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Create a new branch
exports.createBranch = (req, res) => {
  Branch.create({
    name: req.body.name,
  })
    .then((branch) => {
      res.status(201).send({ message: "Branch aggiunto con successo!", branch });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Update a branch
exports.updateBranch = (req, res) => {
  Branch.update(
    {
      name: req.body.name,
    },
    { where: { id: req.params.id } }
  )
    .then((rowsUpdated) => {
      if (rowsUpdated[0] === 0) {
        return res.status(404).send({ message: "Branch non trovato" });
      }
      res.status(200).send({ message: "Branch modificato con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Delete a branch
exports.deleteBranch = (req, res) => {
  Branch.destroy({
    where: { id: req.params.id },
  })
    .then((deleted) => {
      if (deleted === 0) {
        return res.status(404).send({ message: "Branch non trovato" });
      }
      res.status(200).send({ message: "Branch eliminato con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
