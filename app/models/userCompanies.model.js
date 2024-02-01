module.exports = (sequelize, Sequelize) => {
  const UserCompanies = sequelize.define("user_companies", {
    userId: {
      type: Sequelize.INTEGER,
    },
    companyId: {
      type: Sequelize.INTEGER,
    },
  });
  return UserCompanies;
};
