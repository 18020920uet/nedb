const Datastore = require("nedb");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

var db = new Datastore({ filename: "db/nested.db" });

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", async (req, res, next) => {
  const startTime = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.find({}, (err, docs) => {
      if (err) next(err);
      if (!docs) next("Not found");
      else resolve(docs);
    });
  });
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - start) / 1000,
  });
});

app.get("/count", async (req, res, next) => {
  const startTime = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.count({}, (err, n) => {
      if (err) next(err);
      if (!n) next("Not found");
      else resolve(n);
    });
  });
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - start) / 1000,
  });
});

app.post("/create", async (req, res, next) => {
  const create = req.body;
  const startTime = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.insert({ ...create }, async (err, doc) => {
      if (err) reject(err);
      if (!doc) next("Not Create");
      else resolve(doc);
    });
  }).catch((err) => next(err));
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - start) / 1000,
  });
});

app.get("/findOne/:movieId", async (req, res, next) => {
  const movieId = Number(req.params.movieId);
  const start = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.findOne({ movieId: movieId }, (err, doc) => {
      if (err) reject(err);
      if (!doc) next("Not Found");
      else resolve(doc);
    });
  }).catch((err) => next(err));
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - start) / 1000,
  });
});

app.get("/findMany/:movieId", async (req, res, next) => {
  const movieId = Number(req.params.movieId);
  const start = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.find({ movieId: movieId }, (err, doc) => {
      if (err) reject(err);
      if (!doc) next("Not Found");
      else resolve(doc);
    });
  }).catch((err) => next(err));
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - start) / 1000,
  });
});

app.get("/find/option", async (req, res, next) => {
  const movieId = Number(req.params.movieId);
  const lte = Boolean(req.query.lte);
  const start = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.find(
      { movieId: lte ? { $lte: movieId } : { $gte: movieId } },
      (err, doc) => {
        if (err) reject(err);
        if (!doc) next("Not Found");
        else resolve(doc);
      }
    );
  }).catch((err) => next(err));
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - start) / 1000,
  });
});

app.put("/update/:movieId", async (req, res, next) => {
  const movieId = Number(req.params.movieId);

  const update = req.body;
  const start = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.update(
      { movieId: movieId },
      { movieId: movieId, ...update },
      { returnUpdatedDocs: true },
      (err, numberUpdated, upsert) => {
        if (err) reject(err);
        if (!upsert) next(err);
        else resolve(upsert);
      }
    );
  }).catch((err) => next(err));
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - start) / 1000,
  });
});

app.put("/updateMany/:movieId", async (req, res, next) => {
  const movieId = Number(req.params.movieId);

  const update = req.body;
  const start = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.update(
      { movieId: movieId },
      { movieId: movieId, ...update },
      { returnUpdatedDocs: true, multi: true },
      (err, numberUpdated, upsert) => {
        if (err) reject(err);
        if (!upsert) next(err);
        else resolve(upsert);
      }
    );
  }).catch((err) => next(err));
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - start) / 1000,
  });
});

app.delete("/delete/:movieId", async (req, res, next) => {
  const movieId = Number(req.params.movieId);

  const start = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.remove({ movieId: movieId }, (err, result) => {
      if (err) reject(err);
      if (!result) next("Err");
      else resolve(result);
    });
  }).catch((err) => next(err));
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - start) / 1000,
  });
});

app.delete("/deleteMany/:movieId", async (req, res, next) => {
  const movieId = Number(req.params.movieId);

  const start = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.remove({ movieId: movieId }, { multi: true }, (err, result) => {
      if (err) reject(err);
      if (!result) next("Err");
      else resolve(result);
    });
  }).catch((err) => next(err));
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - start) / 1000,
  });
});

app.use(function (err, req, res, next) {
  return res.send({ status: 0, message: err });
});

app.all("*", function (req, res, next) {
  return res.send("Not found");
});

db.loadDatabase((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Loaded database");
    app.listen(3000, () => {
      console.log(`Example app listening at http://localhost:${3000}`);
    });
  }
});
