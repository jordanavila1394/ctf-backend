const db = require("../models");

var moment = require("moment/moment");

const Attendance = db.attendance;
const User = db.user;
const Vehicle = db.vehicle;
const Op = db.Sequelize.Op;

exports.allAttendances = (req, res) => {
  Attendance.findAll({
    include: [
      {
        model: db.user,
        as: "driver",
        include: [
          {
            model: db.company,
            as: "companies",
          },
        ],
      },
    ],
  })
    .then((attendances) => {
      res.status(200).send(attendances);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getDataAttendances = (req, res) => {
  console.log(moment());
  dateTo = moment().add(1, "d").format("YYYY-MM-DD h:mm:ss");
  dateFrom = moment().subtract(4, "d").format("YYYY-MM-DD h:mm:ss");

  const vehiclesNumber = Vehicle.count({});
  const usersNumber = User.count({});

  const checkIns = Attendance.findAll({
    where: {
      createdAt: {
        [Op.between]: [dateFrom, dateTo],
      },
    },
    attributes: [
      [db.Sequelize.literal(`DATE(createdAt)`), "date"],
      [db.Sequelize.literal(`COUNT(*)`), "count"],
    ],
    group: ["date"],
  });

  Promise.all([vehiclesNumber, usersNumber, checkIns])
    .then((response) => {
      res.status(200).send({
        vehiclesNumber: response[0],
        usersNumber: response[1],
        checkIns: response[2],
      });
    })
    .catch((error) => {
      console.log(error);
    });
  // .then((attendances) => {
  //   res.status(200).send({ checkIns: attendances });
  // })
  // .catch((err) => {
  //   res.status(500).send({ message: err.message });
  // });
};
