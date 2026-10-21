const { Sequelize } = require("sequelize"); // Importa Sequelize
const fs = require("fs");
const path = require("path");
const dbConfig = require("../config/db.config");
const { sendMailQueued, getMailUser } = require("../services/mail");

const BACKUP_DIR = path.join(__dirname, "../backups");
const OUTPUT_FILE = path.join(
  BACKUP_DIR,
  `dump_${new Date().toISOString().slice(0, 10)}.sql`
);

const cssFilePath = path.join(__dirname, "../templates/style.css");
const styles = fs.readFileSync(cssFilePath, "utf-8");
const cid = "imagelogo@cid";

const deleteOldBackups = (directory) => {
  const files = fs.readdirSync(directory);
  const now = Date.now();
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && stats.mtime < oneMonthAgo) {
      fs.unlinkSync(filePath);
      console.log(`File eliminato: ${file}`);
    }
  });
};

const createBackupDirectoryIfMissing = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Directory di backup creata: ${directory}`);
  }
};

exports.sendEmail = async (req, res) => {
  const { recipient, subject, message } = req.body;
  const htmlDefaultTemplate = fs.readFileSync(
    path.join(__dirname, "../templates/defaultEmail.html"),
    "utf-8"
  );
  let htmlContent = htmlDefaultTemplate.replace("{{imageCid}}", cid);
  htmlContent = htmlContent.replace("{{message}}", message);

  const mailOptions = {
    from: `CTF Italia <${getMailUser()}>`,
    to: recipient,
    subject: subject,
    html: htmlContent,
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../templates/logo.png"),
        cid: cid,
      },
    ],
  };

  try {
    const info = await sendMailQueued(mailOptions);
    console.log("✅ Email inviata con successo a:", recipient);
    console.log("Info:", info.response);
    if (res) {
      res
        .status(200)
        .send({ message: "Email inviata con successo", info: info.response });
    }
    return info;
  } catch (error) {
    console.error("❌ Errore invio email:", error);
    console.error("Destinatario:", recipient);
    console.error("Oggetto:", subject);
    if (res) {
      res.status(500).send({
        message: "Errore nell'invio dell'email",
        error: error.message,
      });
    }
    throw error;
  }
};

exports.sendBackupEmail = async (req, res) => {
  console.log("Inizio del cron job - Creazione del backup del database...");

  createBackupDirectoryIfMissing(BACKUP_DIR);
  deleteOldBackups(BACKUP_DIR);

  const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: "mysql",
  });

  try {
    const [tables] = await sequelize.query("SHOW TABLES");
    const sqlDump = [];

    for (const table of tables) {
      const tableName = table[`Tables_in_${dbConfig.DB}`];

      const [columns] = await sequelize.query(`SHOW COLUMNS FROM \`${tableName}\``);
      const columnNames = columns.map((col) => `\`${col.Field}\``).join(", ");

      const [rows] = await sequelize.query(`SELECT * FROM \`${tableName}\``);

      if (rows.length > 0) {
        const values = rows
          .map((row) => {
            if (!row) {
              console.warn("Encountered undefined row:", row);
              return "";
            }
            return `(${Object.entries(row)
              .map(([key, value]) => {
                if ((key === "createdAt" || key === "updatedAt") && value) {
                  const date = new Date(value);
                  if (isNaN(date)) {
                    console.warn(`Invalid date value for ${key}:`, value);
                    return `NULL`;
                  }
                  return `'${date
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " ")}'`;
                }
                return `'${value || ""}'`;
              })
              .join(", ")})`;
          })
          .join(", ");

        sqlDump.push(
          `INSERT INTO \`${tableName}\` (${columnNames}) VALUES ${values};\n`
        );
      }
    }

    fs.writeFileSync(OUTPUT_FILE, sqlDump.join(""));
    console.log(`Dump del database salvato in ${OUTPUT_FILE}`);

    if (fs.existsSync(OUTPUT_FILE)) {
      console.log("Invio della mail con il backup...");

      const htmlDefaultTemplate = fs.readFileSync(
        path.join(__dirname, "../templates/defaultEmail.html"),
        "utf-8"
      );

      let htmlContent = htmlDefaultTemplate.replace(
        "{{imageCid}}",
        "imagelogo@cid"
      );
      htmlContent = htmlContent.replace("{{message}}", "BACKUP");

      const mailOptions = {
        from: `CTF Italia <${getMailUser()}>`,
        to: "jordanavila1394@gmail.com",
        subject: "BACKUP-CTF",
        html: htmlContent,
        attachments: [
          {
            filename: path.basename(OUTPUT_FILE),
            path: OUTPUT_FILE,
          },
          {
            filename: "logo.png",
            path: path.join(__dirname, "../templates/logo.png"),
            cid: "imagelogo@cid",
          },
        ],
      };

      try {
        const info = await sendMailQueued(mailOptions);
        console.log(`Email inviata con successo: ${info.response}`);
        if (res) {
          res.status(200).send("Email inviata con successo.");
        }
      } catch (error) {
        console.error(`Errore durante l'invio della mail: ${error.message}`);
        if (res) {
          return res.status(500).send("Errore durante l'invio della mail.");
        }
      }
    } else {
      console.error("File di backup non trovato.");
      if (res) {
        return res.status(500).send("File di backup non trovato.");
      }
    }
  } catch (error) {
    console.error("Errore durante la creazione del dump:", error.message);
    if (res) {
      return res.status(500).send("Errore durante la creazione del dump.");
    }
  } finally {
    await sequelize.close();
  }
};
