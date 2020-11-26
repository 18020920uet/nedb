const Datastore = require("nedb");
const express = require("express");
const bodyParser = require("body-parser");

var db = new Datastore();

db.loadDatabase((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Loaded database");
  }
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/create", async (req, res, next) => {
  const data = req.body;
  const startTime = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.insert({ name: data.name, age: data.age }, async (err, doc) => {
      if (err) next(err);
      if (!doc) next("Not create");
      else resolve(doc);
    });
  });
  res.result = result;
  res.time = (Date.now() - startTime) / 1000;
  next();
});

app.get("/find/:name", async (req, res, next) => {
  const name = req.params.name;
  const start = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.findOne({ name: name }, (err, doc) => {
      console.log(doc);
      if (err) throw err;
      if (!doc) next("Not Found");
      else resolve(doc);
    });
  });
  console.log(result);
  res.result = result;
  res.time = (Date.now() - start) / 1000;
  next();
});

app.put("/update/:name", async (req, res, next) => {
  const name = req.params.name;
  const update = req.body.update;
  const start = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.update({ movieId: id }, { name: name, age: update.age }, (err, doc) => {
      if (err) next(err);
      if (!doc) next(err);
      else resolve(doc);
    });
  });
  res.result = result;
  res.time = (Date.now() - start) / 1000;
  next();
});

app.delete("/delete/:name", async (req, res, next) => {
  const name = req.params.name;
  const start = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.delete({ name: name }, (err, result) => {
      if (err) next(err);
      if (!result) next("Err");
      else resolve(result);
    });
  });
  res.result = result;
  res.time = (Date.now() - start) / 1000;
  next();
});

app.use(function (req, res, next) {
  // if (err) next();
  if (!res.result) next();
  return res.send({
    status: "Success",
    result: res.result,
    time: res.time,
  });
});

app.use(function (err, req, res, next) {
  return res.send({ status: "Fail", message: err });
});

app.all("*", function (req, res, next) {
  return res.send("Not found");
});

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:${3000}`);
});
