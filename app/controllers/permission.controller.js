const db = require("../models");
var moment = require("moment/moment");
const Permission = db.permission;
const Attendance = db.attendance;
const User = db.user;
const Op = db.Sequelize.Op;

exports.createPermission = (req, res) => {
  var ItalyZone = "Europe/Rome";
  const CURRENT_MOMENT = moment()
    .locale(ItalyZone)
    .format("YYYY-MM-DD HH:mm:ss");

  Permission.create({
    userId: req.body.userId,
    companyId: req.body.companyId,
    typology: req.body.typology,
    dates: req.body.dates,
    hours: req.body.hours ? req.body.hours : 0,
    note: req.body.note,
    status: req.body.typology === "Malattia" ? "Approvato" : "In Attesa",
    createdAt: CURRENT_MOMENT,
  })
    .then((permission) => {
      res.status(200).send(permission);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};



exports.getMyPermissions = (req, res) => {
  const idUser = req.body.idUser;

  const startOfMonth = moment()
    .set({ year: req.body.year, month: req.body.month })
    .startOf("month")
    .format("YYYY-MM-DD 00:00");
  const endOfMonth = moment()
    .set({ year: req.body.year, month: req.body.month })
    .endOf("month")
    .format("YYYY-MM-DD 23:59");

  Permission.findAll({
    where: {
      userId: idUser,
      typology: { [Op.ne]: "Malattia" },
      createdAt: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
    },
    order: [["createdAt", "DESC"]],
  })
    .then((permissions) => {
      res.status(200).send(permissions);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getPermissionById = (req, res) => {
  const idPermission = req.body.idPermission;
  Permission.findOne({
    include: [
      {
        model: db.user,
        as: "user",
      },
    ],
    where: {
      id: idPermission,
    },
  })
    .then((permission) => {
      res.status(200).send(permission);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.getMyMedicalLeave = (req, res) => {
  const idUser = req.body.idUser;

  const startOfMonth = moment()
    .set({ year: req.body.year, month: req.body.month })
    .startOf("month")
    .format("YYYY-MM-DD 00:00");
  const endOfMonth = moment()
    .set({ year: req.body.year, month: req.body.month })
    .endOf("month")
    .format("YYYY-MM-DD 23:59");

  Permission.findAll({
    where: {
      userId: idUser,
      typology: { [Op.eq]: "Malattia" },
      createdAt: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
    },
    order: [["createdAt", "DESC"]],
  })
    .then((permissions) => {
      res.status(200).send(permissions);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.allPermissions = (req, res) => {
  const idCompany = req.body.idCompany;
  if (idCompany > 0) {
    Permission.findAll({
      include: [
        {
          model: db.user,
          as: "user",
        },
      ],
      where: {
        companyId: idCompany,
      },
      order: [["createdAt", "DESC"]],
    })
      .then((permissions) => {
        res.status(200).send(permissions);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } else {
    Permission.findAll({
      include: [
        {
          model: db.user,
          as: "user",
        },
      ],
      order: [["createdAt", "DESC"]],
    })
      .then((permissions) => {
        res.status(200).send(permissions);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
};


exports.allPermissionsByMonth = async (req, res) => {
  try {
    const idCompany = req.body.idCompany;
    const whereCondition = idCompany > 0 ? { companyId: idCompany } : {};

    const permissions = await Permission.findAll({
      include: [
        {
          model: db.user,
          as: "user",
        },
      ],
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    // Raggruppa per mese
    const groupedByMonth = permissions.reduce((acc, permission) => {
      const month = permission.createdAt.toISOString().slice(0, 7); // yyyy-MM
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(permission);
      return acc;
    }, {});

    // Ordina i mesi dal più recente al meno recente
    const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => new Date(b) - new Date(a));

    // Ordina per ogni mese con "In Attesa" per primi
    const sortedGroupedByMonth = {};
    sortedMonths.forEach((month) => {
      sortedGroupedByMonth[month] = groupedByMonth[month].sort((a, b) => {
        if (a.status === "In Attesa" && b.status !== "In Attesa") return -1;
        if (a.status !== "In Attesa" && b.status === "In Attesa") return 1;
        return new Date(b.createdAt) - new Date(a.createdAt); // Mantiene l'ordine per data
      });
    });

    res.status(200).send(sortedGroupedByMonth);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};


exports.permissionsByClientAndBranch = async (req, res) => {
  const { associatedClient, associatedBranch, startDate, endDate } = req.body;

  try {
    let queryOptions = {
      include: [
        {
          model: Permission,
          as: "permissions",
          order: [["createdAt", "DESC"]],
        },
        {
          model: Attendance,
          as: "attendances",
          order: [["checkIn", "DESC"]],
        },
      ],
      where: {}, // Inizializza 'where' come oggetto vuoto
    };

    if (associatedClient) {
      queryOptions.where.associatedClient = associatedClient;

    }
    if (associatedBranch) {
      queryOptions.where.associatedBranch = associatedBranch;
    }

    const users = await User.findAll(queryOptions);

    let result = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        surname: user.surname,
        fiscalCode: user.fiscalCode,
        absences: user.permissions
          .map((permission) => {
            return {
              date: permission.dates,
              type: permission.typology,
            };
          })
          .filter((absence) => {
            return absence.date.split(",").some((dateStr) => {
              const [day, month, year] = dateStr.split("-").map(Number);
              const absenceDate = new Date(year, month - 1, day);
              return (
                absenceDate >= new Date(startDate) &&
                absenceDate <= new Date(endDate)
              );
            });
          }),
        attendances: user.attendances
          .map((attendance) => {
            return {
              date: new Date(attendance.checkIn)
                .toLocaleDateString("it-IT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                .replace(/\//g, "-"),
              type: attendance.status,
              hours: formatDifferenceAccurateHours(attendance.checkOut, attendance.checkIn),
            };
          })
          .filter((attendance) => {
            const attendanceDate = new Date(
              attendance.date.split("-").reverse().join("-")
            );
            return (
              attendanceDate >= new Date(startDate) &&
              attendanceDate <= new Date(endDate)
            );
          }),
      };
    });

    result = result.filter(
      (user) => user.absences.length > 0 || user.attendances.length > 0
    );

    // Ordinamento alfabetico per nome e cognome
    result.sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      if (a.surname.toLowerCase() < b.surname.toLowerCase()) return -1;
      if (a.surname.toLowerCase() > b.surname.toLowerCase()) return 1;
      return 0;
    });

    res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};


exports.approvePermission = (req, res) => {
  Permission.update(
    {
      status: "Approvato",
    },
    { where: { id: req.body.id, userId: req.body.userId } }
  )
    .then((permission) => {
      res.status(201).send({ message: "Permesso approvato con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.addProtocolNumberPermission = (req, res) => {
  Permission.update(
    {
      note: req.body.note,
      protocolNumber: req.body.protocolNumber,
    },
    { where: { id: req.body.idPermission } }
  )
    .then((permission) => {
      res.status(201).send({ message: "Permesso aggiornato con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.rejectPermission = (req, res) => {
  Permission.update(
    {
      status: "Negato",
    },
    { where: { id: req.body.id, userId: req.body.userId } }
  )
    .then((permission) => {
      res.status(201).send({ message: "Permesso negato con successo!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.cleanPermissions = async (req, res) => {
  const userId = req.body.userId;

  try {
    // Fetch all permissions for the given user
    let permissions = await Permission.findAll({
      where: { userId: userId }
    });

    // Parse permissions dates into a usable format
    let parsedPermissions = permissions.map(permission => {
      return {
        ...permission.dataValues,
        parsedDates: permission.dates.split(',').map(date => moment(date, "DD-MM-YYYY").format("YYYY-MM-DD"))
      };
    });

    // Create a map to track unique dates and their associated permissions
    let datePermissionMap = {};

    parsedPermissions.forEach(permission => {
      permission.parsedDates.forEach(date => {
        if (!datePermissionMap[date]) {
          datePermissionMap[date] = [];
        }
        datePermissionMap[date].push(permission);
      });
    });

    // Identify and handle overlaps
    for (let date in datePermissionMap) {
      if (datePermissionMap[date].length > 1) {
        // Sort permissions by their createdAt date to keep the most recent one
        datePermissionMap[date].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        let [mostRecentPermission, ...rest] = datePermissionMap[date];

        // Update the most recent permission to only include the date in question
        mostRecentPermission.parsedDates = [date];
        await Permission.update(
          { dates: mostRecentPermission.parsedDates.join(',') },
          { where: { id: mostRecentPermission.id } }
        );

        // Remove the date from all other permissions
        for (let permissionToUpdate of rest) {
          let updatedDates = permissionToUpdate.parsedDates.filter(d => d !== date);

          if (updatedDates.length > 0) {
            await Permission.update(
              { dates: updatedDates.join(',') },
              { where: { id: permissionToUpdate.id } }
            );
          } else {
            await Permission.destroy({ where: { id: permissionToUpdate.id } });
          }
        }
      }
    }

    res.status(200).send({ message: "Permissions cleaned successfully." });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

function formatDifferenceAccurateHours(date2, date1) {
  const checkIn = moment(date1);
  const checkOut = moment(date2);

  // Verifica validità delle date
  if (!checkIn.isValid() || !checkOut.isValid()) {
    return "00:00";
  }

  const duration = moment.duration(checkOut.diff(checkIn));
  let totalMinutes = duration.asMinutes();

  // Limite massimo: 9 ore e 30 minuti = 570 minuti
  const maxMinutes = 9 * 60 + 30;
  if (totalMinutes > maxMinutes) {
    return "09:30";
  }

  if (totalMinutes < 0) {
    return "00:00";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  // Formatta con zeri iniziali
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}`;
}

