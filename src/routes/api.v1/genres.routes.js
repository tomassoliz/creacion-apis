const { list, detail } = require('../../controllers/genresController')

const router = require('express').Router()

/* /api/v1/genres */

router
    .get('/', list)
    .get('/:id', detail)
    
module.exports = router