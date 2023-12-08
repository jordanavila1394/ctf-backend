const db = require(".");

module.exports = (sequelize, Sequelize) => {
  const Image = sequelize.define("images", {
    attendanceId: {
      type: Sequelize.INTEGER,
      references: db.attendance,
      referencesKey: "id",
    },
    name: {
        type: Sequelize.STRING,
      },
    description: {
        type: Sequelize.STRING,
    },
    imageData: {
        type: Sequelize.BLOB,
    },
    typeMIME: {
        type: Sequelize.STRING,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  });

  return Image;
};
