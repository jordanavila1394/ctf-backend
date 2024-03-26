const db = require("../models");
const Entity = db.entity;
const Deadlines = db.deadlines;
const Company = db.company;

const Op = db.Sequelize.Op;
var moment = require("moment/moment");
const emailController = require("./email.controller");
var recipient = ["avila@ctfitalia.com", "jordanavila1394@gmail.com"]; // Sostituisci con l'indirizzo email appropriato

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
      // Calcola la differenza tra la data corrente e la data di scadenza per ogni deadline

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

exports.sendEmailsUnpaidDeadlines = async () => {
  try {
    const dateTo = moment().add(30, "d").format("YYYY-MM-DD 23:59");
    const dateFrom = moment().subtract(30, "d").format("YYYY-MM-DD 00:00");

    const queryOptions = {
      include: [
        {
          model: Deadlines,
          as: "deadlines",
          where: {
            expireDate: {
              [Op.between]: [dateFrom, dateTo],
            },
            status: "Non pagato", // Filtra per scadenze non pagate
          },
        },
        {
          model: Company,
          as: "company",
        },
      ],
    };

    const entities = await Entity.findAll(queryOptions);

    const unpaidDeadlines = entities.reduce((acc, entity) => {
      if (entity.deadlines && Array.isArray(entity.deadlines)) {
        const unpaidDeadlinesForEntity = entity.deadlines.map((deadline) => ({
          entityId: entity.id,
          entityName: entity.name,
          companyName: entity?.company?.name,
          deadlineId: deadline.id,
          deadlineDate: deadline.expireDate,
          importToPay: deadline.importToPay,
          deadlineNote: deadline.note,
        }));

        acc.push(...unpaidDeadlinesForEntity);
      }
      return acc;
    }, []);

    for (const unpaidDeadline of unpaidDeadlines) {
      const subject = `${unpaidDeadline.companyName} - Scadenza non pagata - ${unpaidDeadline.entityName}, N° rata ${unpaidDeadline.deadlineId} - ${unpaidDeadline.importToPay} EUR - Data scadenza ${unpaidDeadline.deadlineDate}`;
      const message = `La scadenza (id ${unpaidDeadline.deadlineId}) per ${unpaidDeadline.entityName}, azienda  ${unpaidDeadline.companyName} non è stata ancora pagata. <br> Bisogna pagare entro il: ${unpaidDeadline.deadlineDate} <br> Importo da pagare: ${unpaidDeadline.importToPay} € <br> Note: ${unpaidDeadline.deadlineNote} <br>  `;

      const req = {
        body: {
          recipient: recipient,
          subject: subject,
          message: message,
        },
      };
      await emailController.sendEmail(req);
    }
  } catch (error) {
    console.error({ message: error.message });
  }
};
