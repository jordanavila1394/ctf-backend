const db = require("../models");
const User = db.user;

module.exports = (sequelize, Sequelize) => {
  const Attendance = sequelize.define("attendances", {
    userId: {
      type: Sequelize.INTEGER,
      references: db.user,
      referencesKey: "id",
    },
    companyId: {
      type: Sequelize.INTEGER,
    },
    placeId: {
      type: Sequelize.INTEGER,
    },
    vehicleId: {
      type: Sequelize.INTEGER,
    },
    checkIn: {
      type: Sequelize.DATE,
    },
    checkOut: {
      type: Sequelize.DATE,
    },
    status: {
      type: Sequelize.STRING,
    },
    note: {
      type: Sequelize.STRING,
    },
    includeFacchinaggio: {
      type: Sequelize.BOOLEAN,
    },
    facchinaggioNameClient: {
      type: Sequelize.STRING,
    },
    facchinaggioAddressClient: {
      type: Sequelize.STRING,
    },
    facchinaggioValue: {
      type: Sequelize.DECIMAL(10, 2),
    },
    includeViaggioExtra: {
      type: Sequelize.BOOLEAN,
    },
    viaggioExtraNameClient: {
      type: Sequelize.STRING,
    },
    viaggioExtraAddressClient: {
      type: Sequelize.STRING,
    },
    viaggioExtraValue: {
      type: Sequelize.DECIMAL(10, 2),
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  });

  return Attendance;
};
