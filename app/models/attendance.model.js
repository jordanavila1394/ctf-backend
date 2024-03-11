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
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  });

  return Attendance;
};
