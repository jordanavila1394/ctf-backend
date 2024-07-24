module.exports = (sequelize, Sequelize) => {
  const Entity = sequelize.define("entities", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    identifier: {
      type: Sequelize.STRING,
    },
    payer: {
      type: Sequelize.STRING,
    },
  });
  return Entity;
};
