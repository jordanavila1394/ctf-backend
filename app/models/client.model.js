module.exports = (sequelize, Sequelize) => {
  const Client = sequelize.define("clients", {
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

  return Client;
};
