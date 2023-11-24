const db = require("../models");
const User = db.user;

module.exports = (sequelize, Sequelize) => {
  const Attendance = sequelize.define("attendances", {
    userId: {
      type: Sequelize.INTEGER,
      references: db.user,
      referencesKey: "id",
    },
    checkOut: {
      type: Sequelize.DATE,
    },
    checkIn: {
      type: Sequelize.DATE,
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
