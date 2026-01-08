module.exports = (sequelize, Sequelize) => {
  const Client = sequelize.define("clients", {
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

  return Client;
};
