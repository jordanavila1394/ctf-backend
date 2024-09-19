const db = require("../models");
const userDocuments = db.userDocument;
const { Op } = require("sequelize");

// Funzione per ottenere i documenti scaduti e quelli che scadono entro 1 mese
exports.getDocumentsExpiring = async (req, res) => {
    try {
        // Data di oggi
        const today = new Date();

        // Data esattamente tra 1 mese
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(today.getMonth() + 1);

        // Condizione per trovare documenti già scaduti o che scadono entro 1 mese
        const condition = {
            expireDate: {
                [Op.or]: [
                    { [Op.lt]: today }, // Documenti già scaduti
                    { [Op.between]: [today, oneMonthFromNow] } // Documenti che scadono entro 1 mese
                ]
            },
        };

        const documents = await userDocuments.findAll({
            include: [
                {
                    model: db.user,
                    attributes: ["id", "name", "surname","cellphone","email"],
                    as: "user",
                }
            ], where: condition });

        res.status(200).json({
            success: true,
            data: documents,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Errore durante il recupero dei documenti",
            error: error.message,
        });
    }
};
