const csv = require("csvtojson");
const Datastore = require("nedb");

var moviesDB = new Datastore({ filename: "db/movies.db", autoload: true });
var nestedDB = new Datastore({ filename: "db/nested.db" });
// var tagsDB = new Datastore({ filename: "db/tags.db", autoload: true });
// var scoresDB = new Datastore({ filename: "db/scores.db" });
// var scores2DB = new Datastore({ filename: "db/scores2.db" });

// moviesDB.loadDatabase(async (err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     const moviesJson = await csv().fromFile("./data/movies.csv");
//     const startTime = Date.now();
//     moviesDB.insert(moviesJson, (err, document) => {
//       if (err) console.log(err);
//       console.log((Date.now() - startTime) / 1000);
//     });
//   }
// });

// tagsDB.loadDatabase(async (err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     const tagsJson = await csv().fromFile("./data/tags.csv");
//     const startTime = Date.now();
//     tagsDB.insert(tagsJson, (err, document) => {
//       if (err) console.log(err);
//       console.log((Date.now() - startTime) / 1000);
//     });
//   }
// });

// scoresDB.loadDatabase(async (err) => {
//   if (err) {
//     console.log(err);
//   } else {
// const scoresJson = await csv().fromFile("./data/scores.csv");
// const startTime = Date.now();db

// });
// }
// });

// scores2DB.loadDatabase(async (err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     const scoresJson = await csv().fromFile("./data/scores2.csv");
//     const startTime = Date.now();
//     scores2DB.insert(scoresJson, (err, document) => {
//       if (err) console.log(err);
//       console.log((Date.now() - startTime) / 1000);
//     });
//   }
// });

nestedDB.loadDatabase(async (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Loaded Database");
    const scores = await csv().fromFile("./data/scores.csv");
    const tags = await csv().fromFile("./data/tags.csv");
    console.log("Loaded input");

    const movies = await new Promise(async (resolve, reject) => {
      moviesDB.find({}, {}, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    let i = 0;
    for (let movie of movies) {
      console.log(i);
      const newMovie = {
        _id: movie._id,
        movieId: Number(movie.movieId),
        title: movie.title,
        genres: movie.genres,
        tags: [],
      };

      const movieScores = scores.filter((val) => val.movieId === movie.movieId);

      if (movieScores != 0) {
        movieScores.forEach((movieScore) =>
          newMovie.tags.push({
            tagId: Number(movieScore.tagId),
            tag: tags.find((val) => val.tagId === movieScore.tagId).tag,
            relevance: Number(movieScore.relevance),
          })
        );
      }

      await new Promise(async (resolve, reject) => {
        nestedDB.insert(newMovie, (err, doc) => {
          if (err) console.log(err);
          else {
            resolve(true);
          }
        });
      });
      i++;
    }
  }
});
