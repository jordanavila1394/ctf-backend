module.exports = (sequelize, Sequelize) => {
  const Company = sequelize.define("companies", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    reaNumber: {
      type: Sequelize.STRING,
    },
    vat: {
      type: Sequelize.STRING,
    },
    legalForm: {
      type: Sequelize.STRING,
    },
    registeredOffice: {
      type: Sequelize.STRING,
    },
    headOffice: {
      type: Sequelize.STRING,
    },
    phone: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    pec: {
      type: Sequelize.STRING,
    },
    website: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.BOOLEAN,
    },
    userId: {
      type: Sequelize.INTEGER,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  });

  return Company;
};
