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

exports.monthlySummary = (req, res) => {
  const idCompany = req.body.idCompany;
  const year = req.body.year;

  // Array per memorizzare i risultati di ogni mese
  const monthlySummary = [];

  // Per ogni mese, creiamo un oggetto summary e lo aggiungiamo a monthlySummary
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

    // Esegui la query per trovare le entità con le scadenze per questo mese
    Entity.findAll(queryOptions)
      .then((entities) => {
        // Verifica se ci sono entità trovate per il mese corrente
        if (entities.length > 0) {
          // Calcoliamo il totale e l'importo mancante per questo mese
          let totalImportToPay = 0;
          let missingImportToPay = 0;

          entities.forEach((entity) => {
            // Verifica se l'entità ha deadlines e che sia un array
            if (entity.deadlines && Array.isArray(entity.deadlines)) {
              entity.deadlines.forEach((deadline) => {
                // Controlliamo se l'importo da pagare è valido
                if (deadline.importToPay) {
                  totalImportToPay += parseFloat(deadline.importToPay);
                  // Controlliamo se lo stato è "Pagato" (case-sensitive)
                  if (deadline.status !== "Pagato") {
                    missingImportToPay += parseFloat(deadline.importToPay);
                  }
                }
              });
            }
          });

          // Creiamo l'oggetto summary per questo mese
          const summary = {
            id: month,
            totalImportToPay: totalImportToPay,
            missingImportToPay: missingImportToPay,
          };

          // Aggiungiamo summary a monthlySummary
          monthlySummary.push(summary);
        } else {
          // Se non ci sono entità trovate per il mese, impostiamo i valori su zero
          const summary = {
            id: month,
            totalImportToPay: 0,
            missingImportToPay: 0,
          };
          monthlySummary.push(summary);
        }

        // Se abbiamo ottenuto i risultati di tutti i mesi, inviamo la risposta
        if (monthlySummary.length === 12) {
          res.status(200).json(monthlySummary);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  }
};
