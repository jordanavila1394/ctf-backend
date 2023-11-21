const db = require("../models");
const User = db.user;
const Company = db.company;
const Role = db.role;

const Op = db.Sequelize.Op;
var bcrypt = require("bcryptjs");

exports.allCeos = (req, res) => {
  User.findAll({
    include: [
      {
        model: db.role,
        where: [{ id: 4 }],
        attributes: ["id", "name", "label"],
        as: "roles",
      },
      {
        model: db.company,
        as: "companies",
      },
    ],
    attributes: { include: ["id", "name", "surname"], exclude: ["password"] },
  })
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.allCeosByCompany = (req, res) => {
  User.findAll({
    include: [
      {
        model: db.role,
        where: [{ id: 4 }],
        attributes: ["id", "name", "label"],
        as: "roles",
      },
      {
        model: db.company,
        where: [{ id: req.params.id }],

        as: "companies",
      },
    ],
    attributes: { include: ["id", "name", "surname"], exclude: ["password"] },
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
        attributes: {
          include: ["id", "name", "label"],
          order: [["label", "ASC"]],
        },
        as: "roles",
      },
      {
        model: db.company,
        as: "companies",
        order: [["name", "ASC"]],
      },
    ],
    attributes: { exclude: ["password"] },
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
    password: bcrypt.hashSync(req.body.password, 8),
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    status: req.body.status,
  })
    .then((user) => {
      user.addRole(req.body.roleId);
      user.addCompany(req.body.companyId);
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
    include: [
      {
        model: db.role,
        attributes: ["id", "name", "label"],
        as: "roles",
      },
      {
        model: db.company,
        as: "companies",
      },
    ],
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
      res.send({ message: "User registered successfully!" });
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
