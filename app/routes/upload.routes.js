const { authJwt } = require("../middleware");
const multer = require("multer");
const AWS = require("aws-sdk");
const db = require("../models");
const AttendanceImages = db.attendanceImage;
const userDocuments = db.userDocument;
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
        return res.status(400).send("No files were uploaded.");
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
      const files = req.files;
      const userId = req.body.userId;
      const category = req.body.category;
      const fiscalCode = req.body.fiscalCode;

      if (!files) {
        return res.status(400).send("No files were uploaded.");
      }

      // Upload each file to Digital Ocean Spaces
      const uploadPromises = files.map((file, index) => {
        const params = {
          Bucket: "ctf.images",
          Key:
            "documents/" +
            fiscalCode +
            "/" +
            category +
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
+            userDocuments.create({
              userId: userId,
              fiscalCode: fiscalCode,
              category: category,
              etag: result?.ETag,
              location: result?.Location,
              keyFile: result?.Key,
              bucket: result?.Bucket,
            });
          }
          res.status(201).send({ message: "Documento aggiunto con successo!" });
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
};
