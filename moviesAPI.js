const express = require("express");
const path = require("path");

const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
// const dbPath = path.join(__dirname,"moviesData.db");
const dbPath="D:\\Prash\\Work\\ExpressJS\\moviesData.db";

let db=null;

const initializeDBAndServer = async() => {
    try{
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server Running at http://localhost:3000/");
        });
    }catch(e){
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/home/", async(request,response) => {
  response.send("This is home page of MoviesAPI...");
});

app.get("/movies/", async(request,response) => {
    const getMoviesQuery = `
    SELECT movie_name FROM movie;`;
    const queryResult = await db.all(getMoviesQuery);
    const ans = (queryResult) => {
      return{
        movieName: queryResult.movie_name,
      };
    };
    response.send(
        queryResult.map((eachMovie) => ans(eachMovie))
        );
});

app.post("/movies/", async(request,response) => {
    const movieDetails = request.body;
    const {
            directorId,
            movieName,
            leadActor,
          } = movieDetails;
    const addMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor) 
    VALUES(
        '${directorId}',
        ${movieName},
        '${leadActor}');`;
    await db.run(addMovieQuery);
    response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async(request,response) => {
    const {movieId} = request.params;
    const getMovieDetailQuery = `
    SELECT * FROM movie WHERE movie_id=${movieId};`;
    const dbResponse = await db.get(getMovieDetailQuery);
    const ans = (dbObject) => {
      return{
        movieId: dbObject.movie_id,
        directorId: dbObject.director_id,
        movieName: dbObject.movie_name,
        leadActor: dbObject.lead_actor,
      };
    };
    response.send(ans(dbResponse))
});

app.put("/movies/:movieId/", async(request,response) => {
    const {movieId} = request.params;
    const movieDetails = request.body;
    const {directorId,
            movieName,
            leadActor} = movieDetails;
    const updateMovieQuery = `
    UPDATE movie SET 
        director_id = '${directorId}',
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async(request,response) => {
    const {movieId} = request.params;
    const deleteMovieQuery = `
    DELETE from movie
    WHERE movie_id=${movieId};`;
    await db.run(deleteMovieQuery);
    response.send("Movie Removed");
});

app.get("/directors/", async(request,response) => {
    const getDirectorsQuery = `
    SELECT * FROM director;`;
    const queryResult = await db.all(getDirectorsQuery);
    const ans = (dbObject) => {
      return{
        directorId: dbObject.director_id,
        directorName: dbObject.director_name,
      };
    };
    response.send(
        queryResult.map((eachDirector) => ans(eachDirector))
        );
});

app.get("/directors/:directorId/movies/", async(request,response) => {
    const {directorId} = request.params;
    const getDirectorMoviesQuery = `
    SELECT movie_name FROM movie where director_id=${directorId};`;
    const queryResult = await db.all(getDirectorMoviesQuery);
    const ans = (dbObject) => {
      return{
        movieName: dbObject.movie_name,
      };
    };
    response.send(ans(queryResult));
});

// module.exports = app;
