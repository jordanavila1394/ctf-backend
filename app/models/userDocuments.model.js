const db = require(".");

module.exports = (sequelize, Sequelize) => {
  const userDocuments = sequelize.define("userDocuments", {
    userId: {
      type: Sequelize.INTEGER,
      references: db.user,
      referencesKey: "id",
    },
    fiscalCode: {
      type: Sequelize.STRING,
    },
    category: {
      type: Sequelize.STRING,
    },
    etag: {
      type: Sequelize.STRING,
    },
    location: {
      type: Sequelize.STRING,
    },
    keyFile: {
      type: Sequelize.STRING,
    },
    bucket: {
      type: Sequelize.STRING,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  });

  return userDocuments;
};
