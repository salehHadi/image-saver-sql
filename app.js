const express = require("express");
const { engine } = require("express-handlebars");
const fileUpload = require("express-fileupload");
const mySQL = require("mysql");

const app = express();
const port = process.env.PORT || 4000;

// defualt option
app.use(fileUpload());

// Static file
app.use(express.static("public"));
app.use(express.static("upload"));

// Template engine
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Connection Pool
const pool = mySQL.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  //   password: "password",
  database: "userprofile",
});

pool.getConnection((err, connection) => {
  if (err) throw err; // not connected
  console.log("connected!");
});

// Routes
app.get("", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err; // not connected
    console.log("connected!");

    connection.query(`SELECT * FROM user WHERE id = 1`, (err, rows) => {
      // Once done release the connection
      connection.release();

      if (!err) {
        res.render("index", { rows });
      }
    });
  });
});

app.post("", (req, res) => {
  let sampleFile;
  let pathFile;

  if (!req.files || !Object.keys(req.files).length === 0) {
    return res.status(200).send("No files were uploaded.");
  }

  sampleFile = req.files.sampleFile;
  pathFile = __dirname + "/upload/" + sampleFile.name;

  sampleFile.mv(pathFile, function (err) {
    if (err) {
      return res.status(500).send({
        success: "false",
      });
    }

    pool.getConnection((err, connection) => {
      if (err) throw err; // not connected
      console.log("connected!");

      connection.query(
        `UPDATE user SET profile_image = ? WHERE id = 1`,
        [sampleFile.name],
        (err, rows) => {
          // Once done release the connection
          connection.release();

          if (!err) {
            res.redirect("/");
          } else {
            console.log(err);
          }
        }
      );
    });

    // res.status(200).send({
    //   success: true,
    //   image: "uploaded",
    // });
  });
});

app.listen(port, () => console.log(`app is running at ${port}`));
