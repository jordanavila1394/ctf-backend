module.exports = (sequelize, Sequelize) => {
  const Company = sequelize.define("companies", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    vat: {
      type: Sequelize.STRING,
    },
    registered_office: {
      type: Sequelize.STRING,
    },
    head_office: {
      type: Sequelize.STRING,
    },
    phone: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    website: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    userId: {
      field: "id_user",
      type: Sequelize.INTEGER,
    },
    createdAt: {
      field: "created_at",
      type: Sequelize.DATE,
    },
    updatedAt: {
      field: "updated_at",
      type: Sequelize.DATE,
    },
  });

  return Company;
};
