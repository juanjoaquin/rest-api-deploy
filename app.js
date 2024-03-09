const express = require("express")
const crypto = require("node:crypto")
const {validateMovie, validatePartialMovie} = require('./schemas/movies.js');
const app = express()
app.use(express.json());

const PORT = process.env.PORT ?? 1234

const moviesJSON = require("./movies.json")

const ACCEPTED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:1234",
    "http://movies.com", 
    "http://paraproduccion.com"
]

// get de TODAS las movies, y filtrando por género
app.get("/movies", (req, res) => {
    const origin = req.header("origin")
    
    if(ACCEPTED_ORIGINS.includes(origin) || !origin ) {
        res.header("Access-Control-Allow-Origin", origin)
    }


    const { genre } = req.query
    if(genre) {
        const filteredMovie = moviesJSON.filter(movie => 
        movie.genre.some(g => g.toLowerCase() == genre.toLowerCase()))

        return res.json(filteredMovie)
    }

    res.json(moviesJSON)
})

// Recuperar peliculas por su ID
app.get("/movies/:id", (req, res) => {
    const { id } = req.params
    const movieById = moviesJSON.find(movie => movie.id === id)

    if(movieById) return res.json(movieById)
    res.status(404).json({message: "No se pudo encontrar la película por su ID"})
})

// Creando una película con POST
app.post("/movies", (req, res) => {
    
    const result = validateMovie(req.body)
    
    if (result.error) {
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }
    /*     const {
        title, 
        genre,
        year,
        director,
        duration,
        rate,
        poster
    } = req.body */

    const newMovie = {
        id: crypto.randomUUID(), // crea un uuid versión 4
        ...result.data
/*         title,
        genre,
        year,
        director,
        duration,
        rate: rate ?? 0, // Valor default = 0
        poster */
    }
    moviesJSON.push(newMovie)
    res.status(201).json(newMovie)
})

app.patch("/movies/:id", (req, res) => {

    const origin = req.header("origin")
    
    if(ACCEPTED_ORIGINS.includes(origin) || !origin ) {
        res.header("Access-Control-Allow-Origin", origin)
    }

    const result = validatePartialMovie(req.body)
    if(result.error) {
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const {id} = req.params
    const movieIdPatch = moviesJSON.findIndex(movie => movie.id === id)
    if(movieIdPatch == -1 ) {
        return res.status(404).json({message: "No se pudo encontrar la película"})
    }
    const updateMovie = {
        ...moviesJSON[movieIdPatch],
        ...result.data
    }

moviesJSON[movieIdPatch] = updateMovie
return res.json(updateMovie)

})

app.delete("/movies/:id", (req, res) => {
    const {id} = req.params
    const movieIdPatch = moviesJSON.findIndex(movie => movie.id === id)
    if(movieIdPatch == -1) {
        return res.status(404).json({message: "No se pudo encontrar la peli"})
    }    

    const origin = req.header("origin")
    if(ACCEPTED_ORIGINS.includes(origin) || !origin ) {
        res.header("Access-Control-Allow-Origin", origin)
    }

    moviesJSON.splice(movieIdPatch, 1)
    return res.json({message: "Movie deleted"})
})

app.options("/movies/:id", (req, res) => {
    const origin = req.header("origin")
    
    if(ACCEPTED_ORIGINS.includes(origin) || !origin ) {
        res.header("Access-Control-Allow-Origin", origin)
        res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE")
    }
    res.send(200)
})

app.use((req, res) => {  
    res.status(404).send("<h1>Error 404</h1>")
})

app.listen(PORT, () => {
    console.log(`Listening sv on: http://localhost:${PORT}`)
})