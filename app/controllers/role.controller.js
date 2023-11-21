const db = require("../models");
const Role = db.role;
const Op = db.Sequelize.Op;

exports.allRoles = (req, res) => {
  Role.findAll({
    where: { id: { [Op.not]: [3] } }, //Exclude roles admin
  })
    .then((roles) => {
      res.status(200).send(roles);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// exports.createUser = (req, res) => {
//   // Save User to Database
//   User.create({
//     username: req.body.username,
//     password: bcrypt.hashSync(req.body.password, 8),
//     name: req.body.name,
//     surname: req.body.surname,
//     email: req.body.email,
//     status: req.body.status,
//   })
//     .then((user) => {
//       res.status(201).send({ message: "Utente aggiunto con successo!" });
//     })
//     .catch((err) => {
//       res.status(500).send({ message: err.message });
//     });
// };

// exports.deleteUser = (req, res) => {
//   // Delete User
//   User.destroy({
//     where: { id: req.params.id },
//   })
//     .then((user) => {
//       res.status(201).send({ message: "Utente eliminato con successo!" });
//     })
//     .catch((err) => {
//       res.status(500).send({ message: err.message });
//     });
// };

// exports.getUser = (req, res) => {
//   // Get User
//   User.findOne({
//     where: { id: req.params.id },
//   })
//     .then((user) => {
//       if (user) {
//         res.status(200).send(user);
//       } else {
//         res.status(500).send({ message: "Utente non trovata" });
//       }
//     })
//     .catch((err) => {
//       res.status(500).send({ message: err.message });
//     });
// };

// exports.patchUser = (req, res) => {
//   // Save User to Database
//   User.update(
//     {
//       username: req.body.username,
//       name: req.body.name,
//       surname: req.body.surname,
//       email: req.body.email,
//       status: req.body.status,
//     },
//     { where: { id: req.params.id } }
//   )
//     .then((user) => {
//       res.status(201).send({
//         message: "Azienda modificata con successo!",
//       });
//     })
//     .catch((err) => {
//       res.status(500).send({ message: err.message });
//     });
// };
