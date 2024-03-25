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

  // Oggetto per memorizzare la somma di importToPay per ogni mese
  const monthlySum = {};

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
    promises.push(
      Entity.findAll(queryOptions).then((data) => {
        // Calcola la somma di importToPay per questo mese
        const sum = data.reduce(
          (acc, val) =>
            acc + val.deadlines.reduce((acc, val) => acc + val.importToPay, 0),
          0
        );
        monthlySum[moment().month(month).format("MMMM")] = sum; // Memorizza la somma per questo mese
        return data;
      })
    );
  });

  // Aspetta che tutte le promesse siano risolte e restituisci i dati quando tutte sono state completate
  Promise.all(promises)
    .then((data) => {
      // Concatena i risultati di ciascuna ricerca dei mesi
      const allEntities = data.reduce((acc, val) => acc.concat(val), []);
      res.status(200).send({ allEntities, monthlySum }); // Restituisci sia i dati delle entità che la somma mensile
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
