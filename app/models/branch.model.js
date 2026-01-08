module.exports = (sequelize, Sequelize) => {
  const Branch = sequelize.define("branches", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    },
  });

  return Branch;
};
