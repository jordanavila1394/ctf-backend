const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.company = require("../models/company.model.js")(sequelize, Sequelize);
db.place = require("../models/place.model.js")(sequelize, Sequelize);
db.vehicle = require("../models/vehicle.model.js")(sequelize, Sequelize);
db.attendance = require("../models/attendance.model.js")(sequelize, Sequelize);
db.deadlines = require("../models/deadlines.model.js")(sequelize, Sequelize);
db.entity = require("../models/entity.model.js")(sequelize, Sequelize);
db.permission = require("../models/permission.model.js")(sequelize, Sequelize);
db.attendanceImage = require("../models/attendanceImages.model.js")(
  sequelize,
  Sequelize
);
db.userDocument = require("../models/userDocuments.model.js")(
  sequelize,
  Sequelize
);
db.userCompanies = require("../models/userCompanies.model.js")(
  sequelize,
  Sequelize
);

UserRoles = sequelize.define("user_roles", {
  userId: Sequelize.STRING,
  roleId: Sequelize.STRING,
});

UserCompanies = sequelize.define("user_companies", {
  userId: Sequelize.STRING,
  companyId: Sequelize.STRING,
});

//UserRoles
db.role.belongsToMany(db.user, {
  foreignKey: "roleId",
  otherKey: "userId",
  through: UserRoles,
  as: "users",
});

db.user.belongsToMany(db.role, {
  foreignKey: "userId",
  otherKey: "roleId",
  through: UserRoles,
  as: "roles",
});

//UserCompanies
db.company.belongsToMany(db.user, {
  foreignKey: "companyId",
  otherKey: "userId",
  through: UserCompanies,
  as: "users",
});

db.user.belongsToMany(db.company, {
  foreignKey: "userId",
  otherKey: "companyId",
  through: UserCompanies,
  as: "companies",
});

//Places - Company
db.place.belongsTo(db.company, { foreignKey: "companyId", as: "companies" });

db.company.hasMany(db.place, {
  foreignKey: "companyId",
  as: "places",
});

//Vehicles - User
db.vehicle.belongsTo(db.user, { foreignKey: "userId", as: "user" });
db.user.hasMany(db.vehicle, {
  foreignKey: "userId",
  as: "vehicles",
});

//Vehicles - Company

db.vehicle.belongsTo(db.company, { foreignKey: "companyId", as: "company" });
db.company.hasMany(db.vehicle, {
  foreignKey: "companyId",
  as: "vehicles",
});

//Attendances - User
db.attendance.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.user.hasMany(db.attendance, {
  foreignKey: "userId",
  as: "attendances",
});

//attendanceImages - User

db.attendanceImage.belongsTo(db.attendance, {
  foreignKey: "attendanceId",
  as: "attendance",
});
db.attendance.hasMany(db.attendanceImage, {
  foreignKey: "attendanceId",
  as: "attendanceImages",
});

//Entities

//Places - Company
db.entity.belongsTo(db.company, { foreignKey: "companyId", as: "companies" });

db.company.hasMany(db.entity, {
  foreignKey: "companyId",
  as: "entities",
});


db.deadlines.belongsTo(db.entity, {
  foreignKey: "entityId",
  as: "entities",
});

db.entity.hasMany(db.deadlines, {
  foreignKey: "entityId",
  as: "deadlines",
});

//Attendances - User
db.permission.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.user.hasMany(db.permission, {
  foreignKey: "userId",
  as: "permissions",
});

//userDocuments- User

db.userDocument.belongsTo(db.user, { foreignKey: "userId", as: "user" });

db.user.hasMany(db.userDocument, {
  foreignKey: "userId",
  as: "userDocuments",
});

db.ROLES = ["worker", "admin", "moderator", "ceo"];

module.exports = db;
