const { Sequelize } = require("sequelize"); // Importa Sequelize
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const dbConfig = require("../config/db.config");


const BACKUP_DIR = path.join(__dirname, "../backups");
const OUTPUT_FILE = path.join(BACKUP_DIR, `dump_${new Date().toISOString().slice(0, 10)}.sql`); // File di dump con la data corrente

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "avila@ctfitalia.com",
    pass: "jltp orxo koae bavi",
  },
});

// Load the HTML and CSS template
const cssFilePath = path.join(__dirname, "../templates/style.css");

const styles = fs.readFileSync(cssFilePath, "utf-8");
const cid = "imagelogo@cid";

// Funzione per eliminare i backup più vecchi di un mese
const deleteOldBackups = (directory) => {
  const files = fs.readdirSync(directory);
  const now = Date.now();
  const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000); // 30 giorni in millisecondi

  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && stats.mtime < oneMonthAgo) {
      fs.unlinkSync(filePath); // Elimina il file se è più vecchio di un mese
      console.log(`File eliminato: ${file}`);
    }
  });
};

const createBackupDirectoryIfMissing = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true }); // Crea la directory se non esiste
    console.log(`Directory di backup creata: ${directory}`);
  }
};


exports.sendEmail = (req, res) => {
  const { recipient, subject, message } = req.body;
  const htmlDefaultTemplate = fs.readFileSync(
    path.join(__dirname, "../templates/defaultEmail.html"),
    "utf-8"
  );
  let htmlContent = htmlDefaultTemplate.replace("{{imageCid}}", cid);
  htmlContent = htmlContent.replace("{{message}}", message);

  const mailOptions = {
    from: "info@ctfitalia.com",
    to: recipient,
    subject: subject,
    html: htmlContent,
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../templates/logo.png"),
        cid: cid, //same cid value as in the html img src
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (info?.response) res.status(200).send("Email inviata: ");
  });
};

exports.sendBackupEmail = async (req, res) => {
  console.log("Inizio del cron job - Creazione del backup del database...");

  // Crea la directory di backup se mancante
  createBackupDirectoryIfMissing(BACKUP_DIR);

  // Elimina i backup più vecchi di un mese prima di creare un nuovo dump
  deleteOldBackups(BACKUP_DIR);

  // Configura Sequelize
  const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: 'mysql',
  });

  try {
    // Ottieni l'elenco delle tabelle nel database
    const [tables] = await sequelize.query("SHOW TABLES");
    const sqlDump = [];

    // Estrai i dati da ogni tabella
    for (const table of tables) {
      const tableName = table[`Tables_in_${dbConfig.DB}`]; // Modifica secondo il tuo database

      // Ottieni i nomi delle colonne della tabella
      const [columns] = await sequelize.query(`SHOW COLUMNS FROM \`${tableName}\``);
      const columnNames = columns.map(col => `\`${col.Field}\``).join(', '); // Estrai i nomi delle colonne

      // Estrai i dati dalla tabella
      const [rows] = await sequelize.query(`SELECT * FROM \`${tableName}\``);

      // Crea la stringa SQL per l'inserimento
      if (rows.length > 0) {
        const values = rows.map(row => {
          if (!row) {
            console.warn('Encountered undefined row:', row);
            return ''; // Skip undefined row
          }
          return `(${Object.entries(row).map(([key, value]) => {
            if ((key === 'createdAt' || key === 'updatedAt') && value) {
              const date = new Date(value);
              if (isNaN(date)) {
                console.warn(`Invalid date value for ${key}:`, value);
                return `NULL`; // O ritorna una stringa vuota se preferisci
              }
              return `'${date.toISOString().slice(0, 19).replace('T', ' ')}'`;
            }
            return `'${value || ''}'`;
          }).join(', ')})`;
        }).join(', ');


        sqlDump.push(`INSERT INTO \`${tableName}\` (${columnNames}) VALUES ${values};\n`); // Aggiungi i nomi delle colonne
      }
    }

    // Scrivi il dump in un file
    fs.writeFileSync(OUTPUT_FILE, sqlDump.join(''));
    console.log(`Dump del database salvato in ${OUTPUT_FILE}`);

    // Verifica se il file esiste e invia l'email
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log("Invio della mail con il backup...");

      // Carica il template HTML della mail
      const htmlDefaultTemplate = fs.readFileSync(
        path.join(__dirname, "../templates/defaultEmail.html"),
        "utf-8"
      );

      // Personalizza il contenuto HTML
      let htmlContent = htmlDefaultTemplate.replace("{{imageCid}}", "imagelogo@cid");
      htmlContent = htmlContent.replace("{{message}}", "BACKUP");

      const mailOptions = {
        from: "jordanavila1394@gmail.com",
        to: "jordanavila1394@gmail.com",
        subject: "BACKUP-CTF",
        html: htmlContent,
        attachments: [
          {
            filename: path.basename(OUTPUT_FILE), // Nome del file di dump
            path: OUTPUT_FILE,
          },
          {
            filename: "logo.png", // Allegato dell'immagine del logo
            path: path.join(__dirname, "../templates/logo.png"),
            cid: "imagelogo@cid", // Collegamento per il logo nel corpo della mail
          },
        ],
      };

      // Invia la mail
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Errore durante l'invio della mail: ${error.message}`);
          return res.status(500).send("Errore durante l'invio della mail.");
        }

        console.log(`Email inviata con successo: ${info.response}`);
        res.status(200).send("Email inviata con successo.");
      });
    } else {
      console.error("File di backup non trovato.");
      return res.status(500).send("File di backup non trovato.");
    }
  } catch (error) {
    console.error("Errore durante la creazione del dump:", error.message);
    return res.status(500).send("Errore durante la creazione del dump.");
  } finally {
    await sequelize.close(); // Chiudi la connessione
  }
};
