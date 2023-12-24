const { authJwt } = require("../middleware");
const multer = require("multer");
const AWS = require("aws-sdk");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const db = require("../models");
const AttendanceImages = db.file;

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
      console.log(req.body);
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
          // https://ctf.images.fra1.digitaloceanspaces.com
          //https://ctf.images.fra1.cdn.digitaloceanspaces.com
          for (let result of results) {
            AttendanceImages.create({
              attendanceId: checkInId,
              etag: result?.ETag,
              location: result?.Location,
              keyFile: result?.Key,
              bucket: result?.Bucket,
            });
          }
          res.json(response);
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
      const category = req.body.category;

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
            message: "Images uploaded successfully",
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
          res.json(response);
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
