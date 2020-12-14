const Datastore = require("nedb");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

var db = new Datastore({ filename: "db/nested.db" });

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/:page", async (req, res, next) => {
  const page = req.params.page ? Number(req.params.page) : 0;
  const startTime = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.find({})
      .skip(page * 100)
      .limit(100)
      .exec((err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
  }).catch((err) => next(err));
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - startTime) / 1000,
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
    time: (Date.now() - startTime) / 1000,
  });
});

app.post("/create", async (req, res, next) => {
  const { title, genres, movieId } = req.body;
  const startTime = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.insert(
      { title: title, genres: genres, movieId: movieId, tags: [] },
      async (err, doc) => {
        if (err) reject(err);
        if (!doc) next("Not Create");
        else resolve(doc);
      }
    );
  }).catch((err) => next(err));
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - startTime) / 1000,
  });
});

app.get("/findOne/:movieId", async (req, res, next) => {
  const movieId = Number(req.params.movieId);
  const startTime = Date.now();
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
    time: (Date.now() - startTime) / 1000,
  });
});

app.get("/findManyLowerThan/:movieId", async (req, res, next) => {
  const movieId = Number(req.params.movieId);
  const startTime = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.find({ movieId: { $lte: movieId } }, (err, doc) => {
      if (err) reject(err);
      if (!doc) next("Not Found");
      else resolve(doc);
    });
  }).catch((err) => next(err));
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - startTime) / 1000,
  });
});

app.put("/updateOne/:movieId", async (req, res, next) => {
  const movieId = Number(req.params.movieId);
  // tag: {tagId: number,tag: string, relevance: number}
  const { title, genres, tags } = req.body;
  const startTime = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.update(
      { movieId: movieId },
      {
        movieId: movieId,
        title: title,
        genres: genres,
        tags: tags,
      },
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
    time: (Date.now() - startTime) / 1000,
  });
});

app.put("/updateManyHigherThan/:movieId", async (req, res, next) => {
  const movieId = Number(req.params.movieId);
  const startTime = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.update(
      { movieId: { $gte: movieId } },
      { movieId: movieId, isUpdated: true },
      { returnUpdatedDocs: true, multi: true, upsert: true },
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
    time: (Date.now() - startTime) / 1000,
  });
});

app.delete("/deleteManyHigherThan/:movieId", async (req, res, next) => {
  const movieId = Number(req.params.movieId);
  const startTime = Date.now();
  const result = await new Promise((resolve, reject) => {
    db.remove(
      { movieId: { $gte: movieId } },
      { multi: true },
      (err, result) => {
        if (err) reject(err);
        if (!result) next("Err");
        else resolve(result);
      }
    );
  }).catch((err) => next(err));
  return res.send({
    status: 1,
    result: result,
    time: (Date.now() - startTime) / 1000,
  });
});

app.delete("/delete/:movieId", async (req, res, next) => {
  const movieId = Number(req.params.movieId);
  const startTime = Date.now();
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
    time: (Date.now() - startTime) / 1000,
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
