// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const sqlite = require("sqlite3");
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
let database;

database = new sqlite.Database("database.db", function(err) {
  if (err) throw err;
  console.log("資料庫讀取成功!");
});

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// send the default array of dreams to the webpage
app.get("/*", (request, response) => {
  // express helps us take JS objects and send them as JSON
  var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
  if(fullUrl.includes("/favicon.ico")) return;
  if(fullUrl.includes("/api/")) return;
  database.serialize(function() {
    database.all(`SELECT * FROM urls WHERE shorturl = '${request.originalUrl.replace("/", "")}'`, function(err, result) {
      if(result.length > 0){
        let shorturl = result[0].shorturl;
        let longurl = result[0].longurl;
        response.redirect(longurl);
      }else {
        response.redirect("https://google.com");
      }
    })
  })
});

app.post("/api/", (request, response) => {
  let longurl = request.body.longurl;
  let shorturl = request.body.shorturl;
  database.serialize(function() {
    database.all(`SELECT * FROM urls WHERE shorturl = '${shorturl}'`, function(err, result) {
      if(result.length > 0){
        response.sendStatus(500);
      }else {
        response.sendStatus(200);
        database.run(`INSERT INTO urls (shorturl, longurl) VALUES ('${shorturl}', '${longurl}')`);
      }
    })
  })
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
