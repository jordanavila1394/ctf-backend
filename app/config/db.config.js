module.exports = {
  HOST: "mysql-jg3k",
  USER: "mysql",
  PASSWORD: "Gorillaz13!",
  DB: "mysql",
  dialect: "mysql",
  port: 3306,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
