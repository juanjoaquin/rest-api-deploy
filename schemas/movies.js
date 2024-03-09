const z = require("zod");

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: "Title debería ser un string",
        required_error: "El título debe ser requerido",
    }),
    year: z.number().int().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(0)/* .default(0) => Puede tener un valor de default 0, o cualquier núm*/,
    poster: z.string().url({ // Aquí está la corrección
        message: "Poster debe ser una URL válida"
    }),
    genre: z.array(
        z.enum(["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Crime", "Horror", "Thriller", "Sci-Fi"]),
        {
            required_error: "Pelicula de género requerida",
            invalid_type_error: "Pelicula de género debe ser un array"
        }
    )
});

function validateMovie (object) {
    return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
    return movieSchema.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovie
}
