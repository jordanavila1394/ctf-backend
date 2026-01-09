const db = require("../models");
const Client = db.client;

// Get all clients
exports.getAllClients = (req, res) => {
  Client.findAll({
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
    group: ['clients.id'],
    order: [['name', 'ASC']]
  })
    .then((clients) => {
      res.status(200).send(clients);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Get a single client by ID
exports.getClient = (req, res) => {
  Client.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: db.user,
        as: "users",
        attributes: { exclude: ["password"] },
      }
    ]
  })
    .then((client) => {
      if (client) {
        res.status(200).send(client);
      } else {
        res.status(404).send({ message: "Client non trovato" });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Create a new client
exports.createClient = (req, res) => {
  Client.create({
    name: req.body.name,
  })
    .then((client) => {
      res.status(201).send({ message: "Client aggiunto con successo!", client });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Update a client
exports.updateClient = (req, res) => {
  Client.update(
    {
      name: req.body.name,
    },
    { where: { id: req.params.id } }
  )
    .then((rowsUpdated) => {
      if (rowsUpdated[0] === 0) {
        return res.status(404).send({ message: "Client non trovato" });
      }
      res.status(200).send({ message: "Client modificato con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Delete a client
exports.deleteClient = (req, res) => {
  Client.destroy({
    where: { id: req.params.id },
  })
    .then((deleted) => {
      if (deleted === 0) {
        return res.status(404).send({ message: "Client non trovato" });
      }
      res.status(200).send({ message: "Client eliminato con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
