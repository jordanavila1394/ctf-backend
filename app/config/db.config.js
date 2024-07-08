module.exports = {
  HOST: process.env.MYSQL_HOST ? process.env.MYSQL_HOST : 'localhost',
  USER: process.env.MYSQL_USER ? process.env.MYSQL_USER : 'root',
  PASSWORD: process.env.MYSQL_PASSWORD ? process.env.MYSQL_PASSWORD : '',
  DB: process.env.MYSQL_DATABASE ? process.env.MYSQL_DATABASE : 'ctf_db',
  dialect: "mysql",
  port: 3306,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
