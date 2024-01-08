const { list, detail, create, update, destroy } = require('../../controllers/moviesController')

const router = require('express').Router()

/* /api/v1/movies */

router
    .get('/', list)
    .get('/:id', detail)
    .post('/', create)
    .put('/:id', update)
    .delete('/:id', destroy)

module.exports = router