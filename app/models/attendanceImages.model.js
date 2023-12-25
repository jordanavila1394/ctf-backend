const db = require(".");

module.exports = (sequelize, Sequelize) => {
  const AttendanceImages = sequelize.define("attendanceImages", {
    attendanceId: {
      type: Sequelize.INTEGER,
      references: db.attendance,
      referencesKey: "id",
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

  return AttendanceImages;
};
