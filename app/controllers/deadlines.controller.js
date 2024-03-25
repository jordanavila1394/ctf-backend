const db = require("../models");
const Entity = db.entity;
const Deadlines = db.deadlines;
const Company = db.company;

const Op = db.Sequelize.Op;
var moment = require("moment/moment");

exports.allDeadlines = (req, res) => {
  const idCompany = req.body.idCompany;
  const months = req.body.months; // Array di mesi valori numerici
  const year = req.body.year;

  // Array per memorizzare le promesse di ricerca delle scadenze per ogni mese
  const promises = [];

  // Per ogni mese nell'array dei mesi, creiamo una promessa per trovare le scadenze
  months.forEach((month) => {
    const startOfMonth = moment()
      .set({ year: year, month: month })
      .startOf("month")
      .format("YYYY-MM-DD 00:00");
    const endOfMonth = moment()
      .set({ year: year, month: month })
      .endOf("month")
      .format("YYYY-MM-DD 23:59");

    let queryOptions;
    if (idCompany > 0) {
      queryOptions = {
        include: [
          {
            model: Deadlines,
            as: "deadlines",
            where: {
              expireDate: {
                [Op.between]: [startOfMonth, endOfMonth],
              },
            },
          },
          {
            model: Company,
            as: "company",
            where: {
              id: idCompany,
            },
          },
        ],
      };
    } else {
      queryOptions = {
        include: [
          {
            model: Deadlines,
            as: "deadlines",
            where: {
              expireDate: {
                [Op.between]: [startOfMonth, endOfMonth],
              },
            },
          },
          {
            model: Company,
            as: "company",
          },
        ],
      };
    }

    // Esegui la query per trovare le entità con le scadenze per questo mese
    promises.push(Entity.findAll(queryOptions));
  });

  // Aspetta che tutte le promesse siano risolte e restituisci i dati quando tutte sono state completate
  Promise.all(promises)
    .then((data) => {
      // Concatena i risultati di ciascuna ricerca dei mesi
      const allEntities = data.reduce((acc, val) => acc.concat(val), []);
      res.status(200).send(allEntities);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.monthlySummary = async (req, res) => {
  try {
    const idCompany = req.body.idCompany;
    const year = req.body.year;

    const monthlySummary = [];

    // Array to store all promises for querying the database
    const promises = [];

    for (let month = 0; month < 12; month++) {
      const startOfMonth = moment()
        .set({ year: year, month: month })
        .startOf("month")
        .format("YYYY-MM-DD 00:00");
      const endOfMonth = moment()
        .set({ year: year, month: month })
        .endOf("month")
        .format("YYYY-MM-DD 23:59");

      let queryOptions;
      if (idCompany > 0) {
        queryOptions = {
          include: [
            {
              model: Deadlines,
              as: "deadlines",
              where: {
                expireDate: {
                  [Op.between]: [startOfMonth, endOfMonth],
                },
              },
            },
            {
              model: Company,
              as: "company",
              where: {
                companyId: idCompany,
              },
            },
          ],
        };
      } else {
        queryOptions = {
          include: [
            {
              model: Deadlines,
              as: "deadlines",
              where: {
                expireDate: {
                  [Op.between]: [startOfMonth, endOfMonth],
                },
              },
            },
            {
              model: Company,
              as: "company",
            },
          ],
        };
      }

      // Pushing promise for each month's data retrieval
      promises.push(Entity.findAll(queryOptions));
    }

    // Wait for all promises to resolve
    const results = await Promise.all(promises);

    // Process results
    results.forEach((entities, index) => {
      let totalImportToPay = 0;
      let missingImportToPay = 0;
      let importPayed = 0;

      entities.forEach((entity) => {
        if (entity.deadlines && Array.isArray(entity.deadlines)) {
          entity.deadlines.forEach((deadline) => {
            if (deadline.importToPay) {
              totalImportToPay += parseFloat(deadline.importToPay);
              if (deadline.status !== "Pagato") {
                missingImportToPay += parseFloat(deadline.importToPay);
              }
              if (deadline.status === "Pagato") {
                importPayed += parseFloat(deadline.importToPay);
              }
            }
          });
        }
      });

      const summary = {
        id: index,
        totalImportToPay: totalImportToPay,
        missingImportToPay: missingImportToPay,
        importPayed: importPayed,
        importPayedPerc:
          totalImportToPay === 0 ? 0 : (importPayed * 100) / totalImportToPay,
      };

      monthlySummary.push(summary);
    });

    res.status(200).json(monthlySummary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
