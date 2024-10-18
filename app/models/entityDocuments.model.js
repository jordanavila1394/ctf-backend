const db = require(".");

module.exports = (sequelize, Sequelize) => {
    const entityDocuments = sequelize.define("entityDocuments", {
        entityId: {
            type: Sequelize.INTEGER,
            references: db.entity,
            referencesKey: "id",
        },
        etag: {
            type: Sequelize.STRING,
        },
        location: {
            type: Sequelize.STRING,
        },
        keyFile: {
            type: Sequelize.STRING,
        },
        bucket: {
            type: Sequelize.STRING,
        },
        createdAt: {
            type: Sequelize.DATE,
        },
        updatedAt: {
            type: Sequelize.DATE,
        },
    });

    return entityDocuments;
};
