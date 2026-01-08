module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    name: {
      type: Sequelize.STRING,
    },
    surname: {
      type: Sequelize.STRING,
    },
    fiscalCode: {
      type: Sequelize.STRING,
    },
    workerNumber: {
      type: Sequelize.INTEGER,
    },
    position: {
      type: Sequelize.STRING,
    },
    clientId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'clients',
        key: 'id'
      }
    },
    branchId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'branches',
        key: 'id'
      }
    },
    email: {
      type: Sequelize.STRING,
    },
    iban: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    cellphone: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    pin: {
      type: Sequelize.STRING,
    },
    birthCountry: {
      type: Sequelize.STRING,
    },
    hireDate: {
      type: Sequelize.STRING,
    },
    birthDate: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.BOOLEAN,
    },
    createdAt: {
      type: Sequelize.DATE,
    },
    updatedAt: {
      type: Sequelize.DATE,
    },
  });

  return User;
};
