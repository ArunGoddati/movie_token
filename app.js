const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'moviesData.db')
const app = express()
app.use(express.json())

let db = null

const initializationDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log('DB Error: ${e.message}')
    process.exit(1)
  }
}
initializationDbAndServer()

const convertDbObjectToResponse = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const directorResponse = directorObject => {
  return {
    directorId: directorObject.director_id,
    directorName: directorObject.director_name,
  }
}

// get api

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
  SELECT
  *
  FROM
  movie
  `
  const movieArray = await db.all(getMoviesQuery)
  response.send(
    movieArray.map(eachMovie => convertDbObjectToResponse(eachMovie)),
  )
})

// Api -- 2

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
  INSERT INTO
  movie(director_id, movie_name, lead_actor)
  VALUES (${directorId}, '${movieName}', '${leadActor}');
  `
  const postMovie = await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

// Api -- 3

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT 
  *
  FROM 
  movie
  WHERE 
  movie_id = ${movieId};
  `
  const getMovie = await db.get(getMovieQuery)
  response.send(convertDbObjectToResponse(getMovie))
})

// Api -- 4

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `
  UPDATE 
  movie 
  SET 
  director_Id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE 
  movie_id = ${movieId};
  `
  const updateMovie = await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

// Api -- 5

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM
  movie
  WHERE
  movie_id = ${movieId};
  `
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

// Api -- 7

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
  SELECT 
  * 
  FROM
  director
  `
  const directorArray = await db.all(getDirectorsQuery)
  response.send(
    directorArray.map(eachDirector => directorResponse(eachDirector)),
  )
})

module.exports = app

// Api -- 7
app.get(`/directors/:directorId/movies/`, async (request, response) => {
  const {directorId} = request.body
  const {movieId} = request.body
  const getMovieNameQuery = `
  SELECT
  *
  FROM 
  director
  WHERE movie_id = ${movieId};
  `
})
