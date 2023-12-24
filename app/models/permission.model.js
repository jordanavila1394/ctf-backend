const db = require("../models");
const User = db.user;

module.exports = (sequelize, Sequelize) => {
  const Permission = sequelize.define("permissions", {
    userId: {
      type: Sequelize.INTEGER,
      references: db.user,
      referencesKey: "id",
    },
    companyId: {
        type: Sequelize.INTEGER,
      },
    typology: {
        type: Sequelize.STRING,
      },
    dates: {
        type: Sequelize.STRING,
    },
    status: {
        type: Sequelize.STRING,
    },
    createdAt: {
        type: Sequelize.DATE,
    },
    updatedAt: {
        type: Sequelize.DATE,
    },
  });

  return Permission;
};
