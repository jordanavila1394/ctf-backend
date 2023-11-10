module.exports = {
  HOST: "localhost",
  USER: "jordan",
  PASSWORD: "Gorillaz13!",
  DB: "ams_db",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
