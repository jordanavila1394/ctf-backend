module.exports = (sequelize, Sequelize) => {
  const Entity = sequelize.define("entity", {
    name: {
      type: Sequelize.STRING,
    },
    identifier: {
      type: Sequelize.STRING,
    },
  });
  return Entity;
};
