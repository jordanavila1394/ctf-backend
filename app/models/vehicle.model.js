const db = require("../models");
const User = db.user;

module.exports = (sequelize, Sequelize) => {
  const Vehicle = sequelize.define("vehicles", {
    licensePlate: {
      type: Sequelize.STRING,
    },
    tipology: {
      type: Sequelize.STRING,
    },
    model: {
      type: Sequelize.STRING,
    },
    rentalType: {
      type: Sequelize.STRING,
    },
    driverType: {
      type: Sequelize.STRING,
    },
    companyId: {
      type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.INTEGER,
      references: db.user,
      referencesKey: "id",
    },
  });

  return Vehicle;
};
