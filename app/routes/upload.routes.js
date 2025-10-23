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

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "ctfcloud@ctfitalia.com",
    pass: "jltp orxo koae bavi",
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

        // 📧 Invio email
        if (email) {
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
            from: "info@ctfitalia.com",
            to: email,
            subject,
            html: htmlContent,
            attachments,
          };

          await transporter.sendMail(mailOptions).catch((err) => {
            console.error("❌ Errore invio email:", err);
          });

          console.log(`📧 Email inviata a ${email}`);
        }

        res.status(201).send({
          success: true,
          message: "Documenti caricati e email inviata",
          files: uploadResults.map((r) => r.fileName),
        });
      } catch (error) {
        console.error("❌ Errore uploadDocumentsAndSendEmail:", error);
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
};
