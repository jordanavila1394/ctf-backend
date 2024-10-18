module.exports = (sequelize, Sequelize) => {
  const Place = sequelize.define("places", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    latitude: {
      type: Sequelize.STRING,
    },
    longitude: {
      type: Sequelize.STRING,
    },
    googlePlaceId: {
      type: Sequelize.STRING,
    },
    url: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    companyId: {
      type: Sequelize.INTEGER,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  });

  return Place;
};
