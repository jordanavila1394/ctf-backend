module.exports = (sequelize, Sequelize) => {
  const Branch = sequelize.define("branches", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  });

  return Branch;
};
