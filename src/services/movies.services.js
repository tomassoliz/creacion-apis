const { Op } = require('sequelize')
const db = require('../database/models');
const createError = require('http-errors')

const getAllMovies = async (limit, offset, keyword) => {

    const options = keyword
        ? {
            where: {
                title: {
                    [Op.substring]: keyword,
                }
            }
        }
        : null;

    try {
        const movies = await db.Movie.findAll({
            limit,
            offset,
            attributes: {
                exclude: ['created_at', 'updated_at', 'genre_id']
            },
            include: [
                {
                    association: 'genre',
                    attributes: ['id', 'name']
                },
                {
                    association: 'actors',
                    attributes: ['id', 'first_name', 'last_name']
                }
            ],
            ...options
        })

        const total = await db.Movie.count({
            ...options
        })

        return {
            movies,
            total
        }

    } catch (error) {
        console.log(error);
        // atrapame y arrojame un error
        throw {
            status: 500,
            message: error.message
        }
    }

};

const getMovieById = async (id) => {

    try {
        if (!id) throw createError(400, 'Id inexistente')

        const movie = await db.Movie.findByPk(id, {
            attributes: {
                exclude: ['created_at', 'updated_at', 'genre_id']
            },
            include: [
                {
                    association: 'genre',
                    attributes: ['id', 'name']
                },
                {
                    association: 'actors',
                    attributes: ['id', 'first_name', 'last_name'],
                    through: {
                        attributes: []
                    }
                }
            ]
        })

        if (!movie) throw createError(404, 'No existe una pelicula con ese Id')

        return movie

    } catch (error) {
        console.log(error);
        // atrapame y arrojame un error
        throw {
            status: error.status || 500,
            message: error.message || 'Hubo un error!'
        }
    }

}

const createMovie = async (dataMovie, actors) => {
    try {

        const newMovie = await db.Movie.create(dataMovie);

        if (actors.length) {
            const actorDB = actors.map(actor => {
                return {
                    movie_id: newMovie.id,
                    actor_id: actor
                }
            })
            await db.Actor_Movie.bulkCreate(actorDB, {
                validate: true
            })
        }

        return await getMovieById(newMovie.id)

    } catch (error) {
        throw {
            status: error.status || 500,
            message: error.message || 'Hubo un error!'
        }
    }
}


const updateMovie = async (id, dataMovie) => {

    try {

        const { title, awards, rating, length, release_date, genre_id, actors } = dataMovie
        const movie = await db.Movie.findByPk(id)

        movie.title = title || movie.title
        movie.awards = awards || movie.awards
        movie.rating = rating || movie.rating
        movie.length = length || movie.length
        movie.release_date = release_date || movie.release_date
        movie.genre_id = genre_id || movie.genre_id

        await movie.save()

        if (actors) {
            await db.Actor_Movie.destroy({
                where: {
                    movie_id: id
                }
            })

            const actorsArray = actors.map(actor => {
                return {
                    movie_id: id,
                    actor_id: actor
                }
            })

            await db.Actor_Movie.bulkCreate(actorsArray, {
                validate: true
            })
        }

        return await getMovieById(movie.id)

    } catch (error) {
        throw {
            status: error.status || 500,
            message: error.message || 'Hubo un error!'
        }
    }
}

const deleteMovie = async (id) => {
    try {
        await db.Actor_Movie.destroy({
            where: {
                movie_id: id
            }
        })

        const movie = await db.Movie.findByPk(id)
        await movie.destroy()

        return null

    } catch (error) {
        throw {
            status: error.status || 500,
            message: error.message || 'Hubo un error!'
        }
    }
}


module.exports = {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie
}