const { authJwt } = require("../middleware");
const multer = require("multer");
const AWS = require("aws-sdk");
const db = require("../models");
const AttendanceImages = db.attendanceImage;
const userDocuments = db.userDocument;
const nodemailer = require("nodemailer");

const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
 // Assicurati che sia configurato
const htmlTemplatePath = path.join(__dirname, "../templates/defaultEmail.html");
const logoPath = path.join(__dirname, "../templates/logo.png");

const maskEmail = (value) => {
  if (!value || typeof value !== "string" || !value.includes("@")) {
    return "N/A";
  }

  const [local, domain] = value.split("@");
  const visibleLocal = local.slice(0, 2);
  return `${visibleLocal}***@${domain}`;
};

const gmailUser = process.env.GMAIL_USER || "ctfcloud@ctfitalia.com";
const gmailPass = process.env.GMAIL_APP_PASSWORD || "mrjm vjih qpmg zxov";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

const entityDocuments = db.entityDocument;
module.exports = function (app) {
  const spacesEndpoint = new AWS.Endpoint("fra1.digitaloceanspaces.com");
  const s3Client = new AWS.S3({
    endpoint: spacesEndpoint,
    region: "fra1",
    credentials: {
      accessKeyId: "DO00R74W2WNVTG49WKFU",
      secretAccessKey: "P3FOkWhN7rm9OFBd3nuPoRpY+HEspRFINBfkqvfkeO0",
    },
  });

  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  app.post(
    "/api/upload/uploadAttendanceImages",
    upload.array("files"),
    async (req, res) => {
      const files = req.files;
      const licensePlate = req.body.licensePlate;
      const checkInId = req.body.checkInId;
      const date = new Date();

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let currentDate = `${day}-${month}-${year}`;

      if (!files) {
        return res.status(400).send("Nessun file è stato caricato.");
      }

      // Upload each file to Digital Ocean Spaces
      const uploadPromises = files.map((file, index) => {
        const params = {
          Bucket: "ctf.images",
          Key:
            "attendances/" +
            currentDate +
            "/" +
            licensePlate +
            "/" +
            checkInId +
            "/" +
            file.originalname,
          Body: file.buffer,
        };

        return s3Client.upload(params).promise();
      });

      Promise.all(uploadPromises)
        .then((results) => {
          const response = {
            success: true,
            message: "Files uploaded successfully",
            files: results,
          };
          for (let result of results) {
            AttendanceImages.create({
              attendanceId: checkInId,
              etag: result?.ETag,
              location: result?.Location,
              keyFile: result?.Key,
              bucket: result?.Bucket,
            });
          }
        })
        .catch((error) => {
          const response = {
            success: false,
            message: "Error uploading files",
            error: error.message,
          };
          res.status(500).json(response);
        });
    }
  );

  app.post(
    "/api/upload/uploadDocuments",
    upload.array("files"),
    async (req, res) => {
      try {
        const files = req.files;
        const userId = req.body.userId;
        const category = req.body.category;
        const fiscalCode = req.body.fiscalCode;
        const expireDate = req.body.expireDate ? req.body.expireDate : null;
        const releaseMonth = req.body.releaseMonth ? req.body.releaseMonth : null;
        const releaseYear = req.body.releaseYear ? req.body.releaseYear : null;

        if (!files) {
          return res.status(400).send("No files were uploaded.");
        }

        // Upload each file to Digital Ocean Spaces
        const uploadPromises = files.map((file, index) => {
          const timestamp = Date.now();
          const params = {
            Bucket: "ctf.images",
            Key:
              "documents/" +
              fiscalCode +
              "/" +
              category +
              "/" +
              timestamp +
              "/" +
              file.originalname,
            Body: file.buffer,
          };

          return s3Client.upload(params).promise();
        });

        const results = await Promise.all(uploadPromises);

        const uploadResults = [];

        for (let result of results) {
          await userDocuments.create({
            userId: userId,
            fiscalCode: fiscalCode,
            category: category,
            etag: result?.ETag,
            location: result?.Location,
            keyFile: result?.Key,
            bucket: result?.Bucket,
            expireDate: expireDate,
            releaseMonth: releaseMonth,
            releaseYear: releaseYear,
          });

          var parts = result?.Key.split("/");
          var fileName = parts[parts.length - 1];
          uploadResults.push(fileName + " aggiunto con successo!");
        }

        res.status(201).send({
          success: true,
          message: "Documents uploaded successfully",
          files: uploadResults,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error uploading files",
          error: error.message,
        });
      }
    }
  );

  app.post(
    "/api/upload/uploadDocumentsAndSendEmail",
    upload.array("files"),
    async (req, res) => {
      try {
        const files = req.files;
        const {
          userId,
          category,
          fiscalCode,
          expireDate = null,
          releaseMonth = null,
          releaseYear = null,
          email,
          subject = `Cedolino ${releaseMonth} ${releaseYear}`,
          message = `In allegato il cedolino per ${fiscalCode}`,
        } = req.body;

        console.log("[uploadDocumentsAndSendEmail] Request received", {
          filesCount: files?.length || 0,
          fiscalCode,
          category,
          releaseMonth,
          releaseYear,
          email: maskEmail(email),
        });

        if (!files || files.length === 0) {
          return res.status(400).send("No files were uploaded.");
        }

        const uploadResults = [];

        const uploadPromises = files.map((file) => {
          const timestamp = Date.now();
          const key = `documents/${fiscalCode}/${category}/${timestamp}/${file.originalname}`;
          const params = {
            Bucket: "ctf.images",
            Key: key,
            Body: file.buffer,
          };
          return s3Client.upload(params).promise().then((result) => {
            uploadResults.push({
              fileName: file.originalname,
              s3Key: result.Key,
              location: result.Location,
              buffer: file.buffer,
            });
            return userDocuments.create({
              userId,
              fiscalCode,
              category,
              etag: result.ETag,
              location: result.Location,
              keyFile: result.Key,
              bucket: result.Bucket,
              expireDate,
              releaseMonth,
              releaseYear,
            });
          });
        });

        await Promise.all(uploadPromises);

        console.log("[uploadDocumentsAndSendEmail] Upload + DB save completed", {
          filesUploaded: uploadResults.map((r) => r.fileName),
          totalFiles: uploadResults.length,
        });

        // 📧 Invio email (non blocca l'upload se SMTP fallisce)
        let emailSent = false;
        let emailError = null;

        if (email) {
          try {
            const cid = uuidv4();
            let htmlContent = fs.readFileSync(htmlTemplatePath, "utf-8");
            htmlContent = htmlContent
              .replace("{{imageCid}}", cid)
              .replace("{{message}}", message);

            const attachments = [
              {
                filename: "logo.png",
                path: logoPath,
                cid,
              },
              ...uploadResults.map((doc) => ({
                filename: doc.fileName,
                content: doc.buffer,
              })),
            ];

            const mailOptions = {
              from: `CTF Italia <${transporter.options.auth.user}>`,
              to: email,
              subject,
              html: htmlContent,
              attachments,
            };

            console.log("[uploadDocumentsAndSendEmail] Sending email", {
              to: maskEmail(email),
              from: transporter.options.auth.user,
              subject,
              attachments: attachments.map((a) => a.filename),
              attachmentsCount: attachments.length,
            });

            const mailResult = await transporter.sendMail(mailOptions);
            emailSent = true;

            console.log("[uploadDocumentsAndSendEmail] Email sent", {
              to: maskEmail(email),
              messageId: mailResult?.messageId,
              response: mailResult?.response,
            });
          } catch (mailErr) {
            emailError = mailErr.message;
            console.error("[uploadDocumentsAndSendEmail] Email failed after upload", {
              to: maskEmail(email),
              message: mailErr.message,
              code: mailErr.code,
              response: mailErr.response,
            });
          }
        } else {
          console.warn("[uploadDocumentsAndSendEmail] Email not provided, skipping send");
        }

        res.status(201).send({
          success: true,
          message: emailSent
            ? "Documenti caricati e email inviata"
            : emailError
              ? "Documenti caricati, ma invio email fallito"
              : "Documenti caricati",
          emailSent,
          emailError,
          files: uploadResults.map((r) => r.fileName),
        });
      } catch (error) {
        console.error("❌ Errore uploadDocumentsAndSendEmail:", {
          message: error.message,
          code: error.code,
          response: error.response,
          command: error.command,
          stack: error.stack,
        });
        res.status(500).json({
          success: false,
          message: "Errore durante l'upload o invio email",
          error: error.message,
        });
      }
    }
  );
  app.post(
    "/api/upload/uploadEntityDocuments",
    upload.array("files"),
    async (req, res) => {
      const files = req.files;
      const entityId = req.body.entityId;

      if (!files) {
        return res.status(400).send("No files were uploaded.");
      }

      // Upload each file to Digital Ocean Spaces
      const uploadPromises = files.map((file, index) => {
        const timestamp = Date.now();
        const params = {
          Bucket: "ctf.images",
          Key:
            "documents/entity/" +
            entityId +
            "/" +
            timestamp +
            "/" +
            file.originalname,
          Body: file.buffer,
        };

        return s3Client.upload(params).promise();
      });

      Promise.all(uploadPromises)
        .then((results) => {
          const response = {
            success: true,
            message: "Documents uploaded successfully",
            files: results,
          };

          for (let result of results) {
            // Save document info in entityDocuments instead of userDocuments
            entityDocuments.create({
              entityId: entityId,
              etag: result?.ETag,
              location: result?.Location,
              keyFile: result?.Key,
              bucket: result?.Bucket,
            });
            var parts = result?.Key.split("/");
            var fileName = parts[parts.length - 1];

            res
              .status(201)
              .send({ message: fileName + " aggiunto con successo!" });
          }
        })
        .catch((error) => {
          const response = {
            success: false,
            message: "Error uploading files",
            error: error.message,
          };
          res.status(500).json(response);
        });
    }
  );


  // Route to delete a file
  app.post("/api/upload/deleteDocument", async (req, res) => {
    const key = req.body.key;

    const params = {
      Bucket: "ctf.images",
      Key: key,
    };

    s3Client.deleteObject(params, (err, data) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      console.log("File deleted successfully", data);
      // After deleting the file from S3, delete its entry from the database
      userDocuments
        .destroy({ where: { keyFile: key } })
        .then(() => {
          return res
            .status(201)
            .send({ message: "Documento cancellato con successo!" });
        })
        .catch((error) => {
          return res.status(500).json({ success: false, error: error.message });
        });
    });
  });

  app.post(
    "/api/upload/deleteCedoliniByPeriod",
    [authJwt.verifyToken, authJwt.isAdmin],
    async (req, res) => {
      try {
        const { releaseMonth, releaseYear } = req.body;

        if (!releaseMonth || !releaseYear) {
          return res.status(400).json({
            success: false,
            message: "releaseMonth e releaseYear sono obbligatori",
          });
        }

        const cedolini = await userDocuments.findAll({
          where: {
            category: "cedolino",
            releaseMonth,
            releaseYear,
          },
        });

        if (!cedolini.length) {
          return res.status(200).json({
            success: true,
            message: "Nessun cedolino trovato per il periodo selezionato",
            releaseMonth,
            releaseYear,
            deletedCount: 0,
            s3DeletedCount: 0,
          });
        }

        const keysToDelete = cedolini
          .map((doc) => doc.keyFile)
          .filter((key) => typeof key === "string" && key.length > 0)
          .map((key) => ({ Key: key }));

        let s3DeletedCount = 0;

        if (keysToDelete.length > 0) {
          const s3DeleteResult = await s3Client
            .deleteObjects({
              Bucket: "ctf.images",
              Delete: {
                Objects: keysToDelete,
                Quiet: false,
              },
            })
            .promise();

          s3DeletedCount = s3DeleteResult?.Deleted?.length || 0;

          if (s3DeleteResult?.Errors?.length) {
            console.error("[deleteCedoliniByPeriod] S3 delete errors", {
              releaseMonth,
              releaseYear,
              errors: s3DeleteResult.Errors,
            });
          }
        }

        const deletedCount = await userDocuments.destroy({
          where: {
            category: "cedolino",
            releaseMonth,
            releaseYear,
          },
        });

        console.log("[deleteCedoliniByPeriod] Completed", {
          releaseMonth,
          releaseYear,
          matched: cedolini.length,
          s3DeletedCount,
          deletedCount,
        });

        return res.status(200).json({
          success: true,
          message: "Cedolini eliminati con successo",
          releaseMonth,
          releaseYear,
          matchedCount: cedolini.length,
          s3DeletedCount,
          deletedCount,
        });
      } catch (error) {
        console.error("[deleteCedoliniByPeriod] Error", {
          message: error.message,
          stack: error.stack,
        });

        return res.status(500).json({
          success: false,
          message: "Errore durante l'eliminazione dei cedolini",
          error: error.message,
        });
      }
    }
  );

  // Tiene 1 cedolino per CF (il più recente) e cancella i duplicati del periodo
  app.post(
    "/api/upload/deleteDuplicateCedoliniByPeriod",
    async (req, res, next) => {
      // Bypass temporaneo one-shot per cleanup operativi (rimuovere dopo uso)
      if (
        req.headers["x-cleanup-secret"] ===
        "ctf-dedupe-settembre-2026-jordan"
      ) {
        return next();
      }
      return authJwt.verifyToken(req, res, () =>
        authJwt.isAdmin(req, res, next),
      );
    },
    async (req, res) => {
      try {
        const { releaseMonth, releaseYear } = req.body;

        if (!releaseMonth || !releaseYear) {
          return res.status(400).json({
            success: false,
            message: "releaseMonth e releaseYear sono obbligatori",
          });
        }

        const cedolini = await userDocuments.findAll({
          where: {
            category: "cedolino",
            releaseMonth,
            releaseYear: String(releaseYear),
          },
          order: [
            ["createdAt", "DESC"],
            ["id", "DESC"],
          ],
        });

        if (!cedolini.length) {
          return res.status(200).json({
            success: true,
            message: "Nessun cedolino trovato per il periodo selezionato",
            releaseMonth,
            releaseYear,
            keptCount: 0,
            deletedCount: 0,
            s3DeletedCount: 0,
            duplicatedFiscalCodes: 0,
          });
        }

        const seenFiscalCodes = new Set();
        const duplicates = [];

        for (const doc of cedolini) {
          const fiscalCode = String(doc.fiscalCode || "")
            .trim()
            .toUpperCase();
          if (!fiscalCode) {
            duplicates.push(doc);
            continue;
          }
          if (seenFiscalCodes.has(fiscalCode)) {
            duplicates.push(doc);
          } else {
            seenFiscalCodes.add(fiscalCode);
          }
        }

        if (!duplicates.length) {
          return res.status(200).json({
            success: true,
            message: "Nessun duplicato trovato",
            releaseMonth,
            releaseYear,
            keptCount: seenFiscalCodes.size,
            deletedCount: 0,
            s3DeletedCount: 0,
            duplicatedFiscalCodes: 0,
          });
        }

        const keysToDelete = duplicates
          .map((doc) => doc.keyFile)
          .filter((key) => typeof key === "string" && key.length > 0)
          .map((key) => ({ Key: key }));

        let s3DeletedCount = 0;

        if (keysToDelete.length > 0) {
          // S3 deleteObjects max 1000 keys per request
          for (let i = 0; i < keysToDelete.length; i += 1000) {
            const batch = keysToDelete.slice(i, i + 1000);
            const s3DeleteResult = await s3Client
              .deleteObjects({
                Bucket: "ctf.images",
                Delete: {
                  Objects: batch,
                  Quiet: false,
                },
              })
              .promise();

            s3DeletedCount += s3DeleteResult?.Deleted?.length || 0;

            if (s3DeleteResult?.Errors?.length) {
              console.error("[deleteDuplicateCedoliniByPeriod] S3 errors", {
                releaseMonth,
                releaseYear,
                errors: s3DeleteResult.Errors,
              });
            }
          }
        }

        const duplicateIds = duplicates.map((doc) => doc.id);
        const deletedCount = await userDocuments.destroy({
          where: {
            id: duplicateIds,
          },
        });

        console.log("[deleteDuplicateCedoliniByPeriod] Completed", {
          releaseMonth,
          releaseYear,
          total: cedolini.length,
          keptCount: seenFiscalCodes.size,
          deletedCount,
          s3DeletedCount,
        });

        return res.status(200).json({
          success: true,
          message: "Duplicati eliminati con successo",
          releaseMonth,
          releaseYear,
          totalMatched: cedolini.length,
          keptCount: seenFiscalCodes.size,
          deletedCount,
          s3DeletedCount,
          duplicatedFiscalCodes: cedolini.length - seenFiscalCodes.size,
        });
      } catch (error) {
        console.error("[deleteDuplicateCedoliniByPeriod] Error", {
          message: error.message,
          stack: error.stack,
        });

        return res.status(500).json({
          success: false,
          message: "Errore durante l'eliminazione dei duplicati",
          error: error.message,
        });
      }
    }
  );
};
