const db = require("../models");
const User = db.user;

module.exports = (sequelize, Sequelize) => {
  const Vehicle = sequelize.define("vehicles", {
    licensePlate: {
      type: Sequelize.STRING,
    },
    tipology: {
      type: Sequelize.STRING,
    },
    model: {
      type: Sequelize.STRING,
    },
    rentalType: {
      type: Sequelize.STRING,
    },
    driverType: {
      type: Sequelize.STRING,
    },
    companyId: {
      type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.INTEGER,
      references: db.user,
      referencesKey: "id",
    },
    mileage: {
      type: Sequelize.INTEGER, // chilometraggio attuale
    },
    lastMaintenanceDate: {
      type: Sequelize.DATE, // data ultimo intervento
    },
    nextMaintenanceDue: {
      type: Sequelize.DATE, // data prossima manutenzione
    },
    engineHealth: {
      type: Sequelize.STRING, // es. 'OK', 'Attenzione', 'Critico'
    },
    batteryVoltage: {
      type: Sequelize.FLOAT, // es. 12.4 (Volt)
    },
    oilLevel: {
      type: Sequelize.FLOAT, // es. % o litri
    },
    tirePressureFL: {
      type: Sequelize.FLOAT, // pressione pneumatico anteriore sinistro
    },
    tirePressureFR: {
      type: Sequelize.FLOAT,
    },
    tirePressureRL: {
      type: Sequelize.FLOAT,
    },
    tirePressureRR: {
      type: Sequelize.FLOAT,
    },
    gpsLatitude: {
      type: Sequelize.FLOAT,
    },
    gpsLongitude: {
      type: Sequelize.FLOAT,
    },
    speed: {
      type: Sequelize.FLOAT, // velocità attuale in km/h
    },
    isEngineOn: {
      type: Sequelize.BOOLEAN, // motore acceso/spento
    },
    alertCode: {
      type: Sequelize.STRING, // es. codici OBD-II come 'P0420'
    },
    lastSync: {
      type: Sequelize.DATE, // ultima comunicazione con i sensori
    }
  });

  return Vehicle;
};
