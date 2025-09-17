const db = require("../models");

var moment = require("moment/moment");

const Attendance = db.attendance;
const Permission = db.permission;
const User = db.user;
const Vehicle = db.vehicle;
const Op = db.Sequelize.Op;

// Utility function for date formatting
const formatDate = (date, format) => moment(date).format(format);

// Utility function for error handling
const handleError = (res, err) => res.status(500).send({ message: err.message });



exports.allAttendances = (req, res) => {
  const idCompany = req.body.idCompany;
  if (idCompany > 0) {
    Attendance.findAll({
      include: [
        {
          model: db.user,
          as: "user",
          include: [
            {
              model: db.company,
              as: "companies",
            },
          ],
        },
      ],
      where: {
        companyId: idCompany,
      },
      order: [["checkIn", "DESC"]],
    })
      .then((attendances) => {
        res.status(200).send(attendances);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } else {
    Attendance.findAll({
      include: [
        {
          model: db.user,
          as: "user",
          include: [
            {
              model: db.company,
              as: "companies",
            },
          ],
        },
      ],
      order: [["checkIn", "DESC"]],
    })
      .then((attendances) => {
        res.status(200).send(attendances);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
};

exports.getAttendance = (req, res) => {
  const idUser = req.body.idUser;
  const TODAY_START = moment().format("YYYY-MM-DD 00:00");
  const NOW = moment().format("YYYY-MM-DD 23:59");

  Attendance.findOne({
    where: {
      userId: idUser,
      checkIn: {
        [Op.between]: [TODAY_START, NOW],
      },
    },
    include: [
      {
        model: db.user,
        as: "user",
        include: [
          {
            model: db.company,
            as: "companies",
          },
        ],
        where: {
          id: idUser,
        },
      },
    ],
  })
    .then((attendance) => {
      if (attendance) {
        res.status(200).send({ foundCheckIn: true, attendance: attendance });
      } else {
        res.status(200).send({ foundCheckIn: false });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getMyAttendances = (req, res) => {
  const idUser = req.body.idUser;

  const startOfMonth = moment()
    .set({ year: req.body.year, month: req.body.month })
    .startOf("month")
    .format("YYYY-MM-DD 00:00");
  const endOfMonth = moment()
    .set({ year: req.body.year, month: req.body.month })
    .endOf("month")
    .format("YYYY-MM-DD 23:59");

  Attendance.findAll({
    where: {
      userId: idUser,
      checkIn: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
    },
    order: [["checkIn", "DESC"]],
  })
    .then((attendances) => {
      res.status(200).send(attendances);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getDataAttendances = (req, res) => {
  let dateTo = moment().format("YYYY-MM-DD 23:59");
  let dateFrom = moment().subtract(5, "d").format("YYYY-MM-DD 00:00");

  let vehiclesNumber = null;
  let usersNumber = null;
  let checkIns = null;
  const idCompany = req.body.idCompany;
  if (idCompany > 0) {
    checkIns = Attendance.findAll({
      where: {
        checkIn: {
          [Op.between]: [dateFrom, dateTo],
        },
        status: "Presente",
        companyId: idCompany,
      },
      attributes: [
        [db.Sequelize.literal(`DATE(checkIn)`), "date"],
        [db.Sequelize.literal(`COUNT(*)`), "count"],
      ],
      group: ["date"],
    });

    usersNumber = User.count({
      include: [
        {
          model: db.company,
          as: "companies",
          where: {
            id: req.body.idCompany,
          },
        },
      ],
    });
    vehiclesNumber = Vehicle.count({
      include: [
        {
          model: db.company,
          as: "company",
          where: {
            id: req.body.idCompany,
          },
        },
      ],
    });
  } else {
    checkIns = Attendance.findAll({
      where: {
        checkIn: {
          [Op.between]: [dateFrom, dateTo],
        },
        status: "Presente",
      },
      attributes: [
        [db.Sequelize.literal(`DATE(checkIn)`), "date"],
        [db.Sequelize.literal(`COUNT(*)`), "count"],
      ],
      group: ["date"],
    });

    usersNumber = User.count({});
    vehiclesNumber = Vehicle.count({});
  }

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

exports.checkInAttendance = (req, res) => {
  var ItalyZone = "Europe/Rome";
  const CURRENT_MOMENT = moment()
    .locale(ItalyZone)
    .format("YYYY-MM-DD HH:mm:ss");

  const createAttendance = Attendance.create({
    userId: req.body.userId,
    companyId: req.body.companyId,
    placeId: req.body.placeId,
    vehicleId: req.body.vehicleId,
    checkIn: CURRENT_MOMENT,
    status: "Presente",
  })
    .then((attendance) => {
      //Create missing attendance user.

      const idUser = req.body.userId;

      const startOfMonth = moment().startOf("month").format("YYYY-MM-DD 00:00");
      const endOfMonth = moment().endOf("month").format("YYYY-MM-DD 23:59");

      Attendance.findAll({
        where: {
          userId: idUser,
          checkIn: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
        order: [["checkIn", "DESC"]],
      }).then((attendances) => {
        //Fix missing checkout
        for (let attendance of attendances) {
          if (
            !(
              moment(attendance?.checkIn).format("DD") == moment().format("DD")
            ) &&
            (attendance?.checkOut == null || attendance?.checkOut == undefined)
          ) {
            Attendance.update(
              {
                checkOut: moment(attendance?.checkIn)
                  .set({ hour: 17, minute: 30 })
                  .utc()
                  .format(),
                status: "CheckOut?",
              },
              { where: { id: attendance?.id } }
            );
          }
        }
        //Fix missing days of month
        let missingDay = new Array();
        let checkInInMonth = moment()
          .startOf("month")
          .set({ hour: 9, minute: 0 });
        const currentDate = moment().set({ hour: 23, minute: 59 });
        while (checkInInMonth.isSameOrBefore(currentDate)) {
          const found = attendances.find(
            (day) =>
              moment(day.checkIn).format("DD") == checkInInMonth.format("DD")
          );

          if (!found || found == undefined) {
            missingDay.push({
              checkIn: moment(checkInInMonth)
                .set({ hour: 8, minute: 0 })
                .utc()
                .format(),
              checkOut: moment(checkInInMonth)
                .set({ hour: 17, minute: 30 })
                .utc()
                .format(),
            });
          }
          checkInInMonth.add(1, "days");
        }
        for (let index = 0; index < missingDay?.length; index++) {
          Attendance.create({
            userId: req.body.userId,
            companyId: req.body.companyId,
            placeId: req.body.placeId,
            vehicleId: req.body.vehicleId,
            checkIn: missingDay[index].checkIn,
            checkOut: missingDay[index].checkOut,
            status: "Verificare",
          });
        }
      });
      res.status(201).send({ message: "CheckIn aggiunto con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.checkOutAttendance = (req, res) => {
  var ItalyZone = "Europe/Rome";
  const CURRENT_MOMENT = moment()
    .locale(ItalyZone)
    .format("YYYY-MM-DD HH:mm:ss");

  Attendance.update(
    {
      checkOut: CURRENT_MOMENT,
      includeFacchinaggio: req.body.includeFacchinaggio ? req.body.includeFacchinaggio : false,
      facchinaggioNameClient: req.body.facchinaggioNameClient,
      facchinaggioAddressClient: req.body.facchinaggioAddressClient,
      facchinaggioValue: req.body.facchinaggioValue,
      includeViaggioExtra: req.body.includeViaggioExtra ? req.body.includeViaggioExtra : false,
      viaggioExtraNameClient: req.body.viaggioExtraNameClient,
      viaggioExtraAddressClient: req.body.viaggioExtraAddressClient,
      viaggioExtraValue: req.body.viaggioExtraValue,
    },
    {
      where: {
        id: req.body.id,
        userId: req.body.userId,

      }
    }
  )
    .then((attendance) => {
      res.status(201).send({ message: "CheckOut aggiunto con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.validateAttendance = (req, res) => {
  Attendance.update(
    {
      status: "Presente",
    },
    { where: { id: req.body.id, userId: req.body.userId } }
  )
    .then((attendance) => {
      res.status(201).send({ message: "Presenza validata con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.unvalidateAttendance = (req, res) => {
  Attendance.update(
    {
      status: "Verificare",
    },
    { where: { id: req.body.id, userId: req.body.userId } }
  )
    .then((attendance) => {
      res.status(201).send({ message: "Presenza messa su verificare" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.changeStatusAttendance = (req, res) => {
  Attendance.update(
    {
      status: req.body.status,
    },
    { where: { id: req.body.id } }
  )
    .then((attendance) => {
      res.status(201).send({ message: "Presenza modificata con successo" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getUserAttendanceSummaryByMonth = (req, res) => {
  // Calcola la data di inizio e fine del mese
  const startOfMonth = moment()
    .set({ year: req.body.year, month: req.body.month })
    .startOf("month")
    .format("YYYY-MM-DD 00:00");
  const endOfMonth = moment()
    .set({ year: req.body.year, month: req.body.month })
    .endOf("month")
    .format("YYYY-MM-DD 23:59");

  // Recupera tutti gli utenti
  User.findAll({
    attributes: ["id", "name", "surname", "fiscalCode"],
  })
    .then((users) => {
      const usersAttendanceSummary = [];

      // Per ogni utente, recuperare le presenze per ogni giorno del mese
      Promise.all(
        users.map((user) => {
          return Attendance.findAll({
            where: {
              userId: user.id,
              checkIn: {
                [Op.between]: [startOfMonth, endOfMonth],
              },
            },
            order: [["checkIn", "ASC"]],
          }).then((attendances) => {
            // Costruisci un oggetto con le informazioni dell'utente e lo stato di presenza per ogni giorno del mese
            const userAttendanceSummary = {
              name: user.name,
              surname: user.surname,
              fiscalCode: user.fiscalCode,
            };

            // Inizializza il conteggio di presenze "Presente" per l'utente
            let presentCount = 0;

            // Riempire l'oggetto con lo stato di presenza per ogni giorno del mese
            let currentDate = moment(startOfMonth);
            while (currentDate.isSameOrBefore(endOfMonth)) {
              const attendanceOfDay = attendances.find((attendance) =>
                moment(attendance.checkIn).isSame(currentDate, "day")
              );

              userAttendanceSummary["GG-" + currentDate.format("DD")] =
                attendanceOfDay
                  ? formatDifferenceAccurateHours(
                    new Date(attendanceOfDay?.checkOut),
                    new Date(attendanceOfDay?.checkIn)
                  )
                  : 0;

              // Aggiorna il conteggio di presenze "Presente"
              if (attendanceOfDay && attendanceOfDay.status === "Presente") {
                presentCount++;
              }

              currentDate.add(1, "day");
            }

            // Aggiungi il conteggio di presenze "Presente" all'oggetto
            userAttendanceSummary.attendanceCount = presentCount;
            // Rearrange object properties
            const rearrangedSummary = {
              id: userAttendanceSummary.id,
              name: userAttendanceSummary.name,
              surname: userAttendanceSummary.surname,
              fiscalCode: userAttendanceSummary.fiscalCode,
              ...Object.entries(userAttendanceSummary)
                .filter(
                  ([key]) =>
                    key !== "id" &&
                    key !== "name" &&
                    key !== "surname" &&
                    key !== "fiscalCode" &&
                    key !== "attendanceCount"
                )
                .reduce((obj, [key, value]) => {
                  obj[key] = parseInt(value, 10);
                  return obj;
                }, {}),
              attendanceCount: userAttendanceSummary.attendanceCount,
            };
            return rearrangedSummary; // Return the rearranged object
          });
        })
      ).then((rearrangedSummaries) => {
        // Change here
        res.status(200).send(rearrangedSummaries); // Change here
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.synchronizeAttendances = async (req, res) => {
  const userId = req.body.idUser;
  const companyId = req.body.idCompany;
  const month = req.body.month;  // month should be 0-11
  const year = req.body.year;

  const ItalyZone = "Europe/Rome";
  const CURRENT_MOMENT = formatDate(moment().locale(ItalyZone), "YYYY-MM-DD HH:mm:ss");

  try {
    const startOfMonth = formatDate(moment().year(year).month(month).startOf("month"), "YYYY-MM-DD 00:00");

    let endOfMonth;
    if (moment().year() === year && moment().month() === month) {
      // If the current month is selected, set endOfMonth to yesterday
      endOfMonth = formatDate(moment().subtract(1, 'day').endOf('day'), "YYYY-MM-DD 23:59");
    } else {
      // Otherwise, set endOfMonth to the end of the selected month
      endOfMonth = formatDate(moment().year(year).month(month).endOf("month"), "YYYY-MM-DD 23:59");
    }

    const attendances = await Attendance.findAll({
      where: {
        userId: userId,
        checkIn: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      order: [["checkIn", "DESC"]],
    });

    // Fix missing checkout
    for (const attendance of attendances) {
      if (moment(attendance.checkIn).format("DD") !== moment().format("DD") && !attendance.checkOut) {
        await Attendance.update(
          {
            checkOut: formatDate(moment(attendance.checkIn).set({ hour: 17, minute: 30 }).utc(), ""),
            status: "CheckOut?",
          },
          { where: { id: attendance.id } }
        );
      }
    }

    // Fix missing days of the month
    const missingDays = [];
    let checkInInMonth = moment(startOfMonth).set({ hour: 9, minute: 0 });
    const monthEndDate = moment(endOfMonth).set({ hour: 23, minute: 59 });

    while (checkInInMonth.isSameOrBefore(monthEndDate)) {
      const found = attendances.find(
        day => moment(day.checkIn).format("DD") === checkInInMonth.format("DD")
      );

      if (!found) {
        missingDays.push({
          checkIn: formatDate(moment(checkInInMonth).set({ hour: 8, minute: 0 }).utc(), ""),
          checkOut: formatDate(moment(checkInInMonth).set({ hour: 17, minute: 30 }).utc(), ""),
        });
      }
      checkInInMonth.add(1, "days");
    }

    for (const day of missingDays) {
      await Attendance.create({
        userId: userId,
        companyId: companyId,
        placeId: req.body.placeId,
        vehicleId: req.body.vehicleId,
        checkIn: day.checkIn,
        checkOut: day.checkOut,
        status: "Verificare",
      });
    }

    const permissions = await Permission.findAll({
      where: {
        userId: userId,
        status: 'Approvato'
      },
    });

    // Filter the permissions by the specified month and year
    const filteredPermissions = permissions.filter(permission => {
      const permissionDates = permission.dates.split(',');
      return permissionDates.some(date => {
        const momentDate = moment(date, "YYYY-MM-DD");
        return momentDate.year() === year && momentDate.month() === month;
      });
    });

    console.log("filteredPermissions ", filteredPermissions);
    console.log("userId ", userId);

    res.status(200).send({ message: "Attendance data synchronized successfully for all users for the specified month!" });
  } catch (err) {
    handleError(res, err);
  }
}

function formatDifferenceHours(date2, date1) {
  let tempHours = 0;
  if (date2) {
    var difference = (date2.getTime() - date1.getTime()) / 1000;
    difference /= 60 * 60;
    tempHours = Math.abs(Math.round(difference));
    if (formatIsWeekendOrFestivo(date1)) {
      return 0;
    }
    if (tempHours < 6) {
      return 6;
    } else if (tempHours > 6) {
      return 8;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}
function calculateMissingWorkingHours(date2, date1) {
  const checkIn = moment(date1);
  const checkOut = moment(date2);
  const duration = moment.duration(checkOut.diff(checkIn));

  const totalWorkedHours = duration.asHours(); // ore decimali
  const standardWorkingHours = 9.5; // 9 ore e 30 minuti

  const missingHours = standardWorkingHours - totalWorkedHours;

  if (missingHours <= 0) {
    return "Nessuna ora mancante";
  }

  const hours = Math.floor(missingHours);
  const minutes = Math.round((missingHours - hours) * 60);
  const rounded = missingHours.toFixed(2);

  return `${hours}:${minutes}`;
}

function formatDifferenceAccurateHours(date2, date1) {
  const checkIn = moment(date1);
  const checkOut = moment(date2);
  const duration = moment.duration(checkOut.diff(checkIn));

  const preciseHours = duration.asHours(); // ore decimali
  const roundedHours = preciseHours.toFixed(2); // es. "6.89"

  const hours = Math.floor(preciseHours); // parte intera
  const minutes = Math.round((preciseHours - hours) * 60); // parte decimale convertita in minuti

  return `${roundedHours} ore (${hours} ore e ${minutes} minuti)`;
}


function formatIsWeekendOrFestivo(date) {
  if (date.getDay() == 6 || date.getDay() == 0) return true;
  return false;
}

