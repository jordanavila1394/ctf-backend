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
    email: {
      type: Sequelize.STRING,
    },
    password: {
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
