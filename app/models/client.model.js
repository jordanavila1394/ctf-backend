module.exports = (sequelize, Sequelize) => {
  const Client = sequelize.define("clients", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false
  });

  return Client;
};
