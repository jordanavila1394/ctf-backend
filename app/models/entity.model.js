module.exports = (sequelize, Sequelize) => {
  const Entity = sequelize.define("entity", {
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
  });
  return Entity;
};