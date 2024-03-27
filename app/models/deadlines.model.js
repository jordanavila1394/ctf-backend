const db = require("../models");
module.exports = (sequelize, Sequelize) => {
  const Deadlines = sequelize.define("deadlines", {
    entityId: {
      type: Sequelize.INTEGER,
      references: db.entity,
      referencesKey: "id",
    },
    loanNumber: {
      type: Sequelize.INTEGER,
    },
    expireDate: {
      type: Sequelize.DATE,
    },
    paymentDate: {
      type: Sequelize.DATE,
    },
    status: {
      type: Sequelize.STRING,
    },
    importToPay: {
      type: Sequelize.DECIMAL(10, 2),
    },
    note: {
      type: Sequelize.TEXT,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  });

  return Deadlines;
};
