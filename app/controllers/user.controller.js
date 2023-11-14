const db = require("../models");
const User = db.user;
const Op = db.Sequelize.Op;

exports.allCeos = (req, res) => {
  User.findAll({
    include: [
      {
        model: db.role,
        where: [{ id: 4 }],
        attributes: ["id", "name", "label"],
      },
    ],
    attributes: ["id", "name", "surname"],
  })
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.allUsers = (req, res) => {
  User.findAll({
    include: [
      {
        model: db.role,
        attributes: ["id", "name", "label"],
      },
    ],
  })
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.createUser = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    status: req.body.status,
  })
    .then((user) => {
      res.status(201).send({ message: "Utente aggiunto con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.deleteUser = (req, res) => {
  // Delete User
  User.destroy({
    where: { id: req.params.id },
  })
    .then((user) => {
      res.status(201).send({ message: "Utente eliminato con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getUser = (req, res) => {
  // Get User
  User.findOne({
    where: { id: req.params.id },
  })
    .then((user) => {
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(500).send({ message: "Utente non trovata" });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.patchUser = (req, res) => {
  // Save User to Database
  User.update(
    {
      username: req.body.username,
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      status: req.body.status,
    },
    { where: { id: req.params.id } }
  )
    .then((user) => {
      res.status(201).send({
        message: "Azienda modificata con successo!",
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// exports.allAccess = (req, res) => {
//   res.status(200).send("Public Content.");
// };

// exports.userBoard = (req, res) => {
//   res.status(200).send("User Content.");
// };

// exports.adminBoard = (req, res) => {
//   res.status(200).send("Admin Content.");
// };

// exports.moderatorBoard = (req, res) => {
//   res.status(200).send("Moderator Content.");
// };
