const db = require("../models");
const XLSX = require("xlsx");

const Entity = db.entity;
const Deadlines = db.deadlines;
const Company = db.company;

const Op = db.Sequelize.Op;
var moment = require("moment/moment");
const emailController = require("./email.controller");
var recipientDeadLines = ["ajaime@ctfitalia.com", "avila@ctfitalia.com"]; // Sostituisci con l'indirizzo email appropriato
const fs = require("fs");

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

      // Raggruppa gli elementi per id e companyId
      const groupedEntities = {};
      allEntities.forEach((entity) => {
        const key = `${entity.id}-${entity.companyId}`;
        if (!groupedEntities[key]) {
          groupedEntities[key] = {
            id: entity.id,
            name: entity.name,
            identifier: entity.identifier,
            payer: entity.payer,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            companyId: entity.companyId,
            deadlines: [],
            company: entity.company,
            totalImportToPay: 0, // Inizializza il totale a 0
            totalImportNotPayed: 0,
            totalImportSum: 0,
          };
        }
        groupedEntities[key].deadlines.push(...entity.deadlines);
        groupedEntities[key].totalImportToPay += entity.deadlines.reduce(
          (total, deadline) => {
            if (deadline.status === "Pagato") {
              return total + parseFloat(deadline.importToPay);
            }
            return total;
          },
          0
        );
        groupedEntities[key].totalImportNotPayed += entity.deadlines.reduce(
          (total, deadline) => {
            if (deadline.status === "Non pagato") {
              return total + parseFloat(deadline.importToPay);
            }
            return total;
          },
          0
        );
        groupedEntities[key].totalImportSum += entity.deadlines.reduce(
          (total, deadline) => {
            return total + parseFloat(deadline.importToPay);
          },
          0
        );
      });

      // Converte l'oggetto raggruppato in un array di valori
      const entities = Object.values(groupedEntities);

      const totalImportToPaySum = entities.reduce((acc, entity) => {
        return acc + entity.totalImportToPay;
      }, 0);

      const totalImportNotPayedSum = entities.reduce((acc, entity) => {
        return acc + entity.totalImportNotPayed;
      }, 0);
      const totalImportSum = entities.reduce((acc, entity) => {
        return acc + entity.totalImportSum;
      }, 0);

      res.status(200).send({
        entities,
        totalImportToPaySum,
        totalImportNotPayedSum,
        totalImportSum,
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.changeStatusDeadline = (req, res) => {
  Deadlines.update(
    {
      status: req.body.status,
    },
    { where: { id: req.body.id } }
  )
    .then((deadline) => {
      res.status(201).send({ message: "Scadenza modificata con successo" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
exports.changePaymentDateDeadline = (req, res) => {
  Deadlines.update(
    {
      paymentDate: req.body.paymentDate,
    },
    { where: { id: req.body.id } }
  )
    .then((deadline) => {
      res
        .status(201)
        .send({ message: "Data pagamento modificata con successo" });
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

exports.uploadDeadlinesExcel = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send("Nessun file è stato caricato.");
  }

  // Assuming the uploaded file is in 'xlsx' format
  const workbook = XLSX.readFile(file.path);

  // Assuming your data is in the first sheet
  const sheet_name_list = workbook.SheetNames;
  const worksheet = workbook.Sheets[sheet_name_list[0]];

  // Convert the worksheet to an array of rows
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  let rowsInsert = [];
  let rowsUpdate = [];
  let entityNotExist = [];
  // Process each row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const entityId = row[0];
    const loanNumber = row[1];
    const excelExpireDate = row[2];
    const importToPay = row[3];
    const status = row[4];

    let expireDate = new Date((excelExpireDate - (25567 + 1)) * 86400 * 1000); // Convert Excel date to milliseconds
    expireDate.setDate(expireDate.getDate() - 1); // Subtract one day

    try {
      const entityExists = await Entity.findOne({
        where: { id: entityId },
      });

      if (!entityExists) {
        entityNotExist = `Entità con id ${entityId} non esiste.`;
        continue;
      }

      // Try to find the deadline record in the database
      let deadline = await Deadlines.findOne({
        where: { entityId, loanNumber },
      });

      if (deadline) {
        // If the deadline record exists, update it
        rowsUpdate.push({ entityId: entityId, loanNumber: loanNumber });
        await deadline.update({
          expireDate: expireDate,
          importToPay: importToPay,
          status: status,
        });
        console.log(
          `Deadline with entityId ${entityId} and loanNumber ${loanNumber} updated.`
        );
      } else {
        // If the deadline record does not exist, create a new one
        rowsInsert.push({ entityId: entityId, loanNumber: loanNumber });
        await Deadlines.create({
          entityId: entityId,
          loanNumber: loanNumber,
          expireDate: expireDate,
          importToPay: importToPay,
          status: status,
        }).then((deadline) => {
          console.log(
            `Deadline with entityId ${entityId} and loanNumber ${loanNumber} created.`
          );
        });
      }
    } catch (error) {
      console.error("Error processing deadline:", error);
    }
  }

  res.status(200).send({ rowsInsert, rowsUpdate, entityNotExist });
};

exports.sendEmailsUnpaidDeadlines = async () => {
  try {
    const dateTo = moment().add(5, "d").format("YYYY-MM-DD 23:59");
    const dateFrom = moment().subtract(5, "d").format("YYYY-MM-DD 00:00");

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
          deadlineDate: moment(deadline.expireDate).format("DD-MM-YYYY"),
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
          recipient: recipientDeadLines,
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
