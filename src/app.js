const express = require('express');
const app = express();
const cors = require('cors')
const paginate = require('express-paginate')




//Aquí pueden colocar las rutas de las APIs
const moviesApiRoutes = require('./routes/api.v1/movies.routes')
const genresApiRoutes = require('./routes/api.v1/genres.routes')


//URL encode  - Para que nos pueda llegar la información desde el formulario al req.body
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(cors())

// siempre antes de la rutas, ademas recibe 2 parametro a traves de middleware(cantidad de elementos por pagina, cantidad maxima de elementos por paginas)
app.use(paginate.middleware(8, 50))

app.use('/api/v1/movies', moviesApiRoutes)
app.use('/api/v1/genres', genresApiRoutes)

app.use('*', (req,res) => res.status(404).json({
    ok: false,
    status : 404,
    error : 'not found'
}))


//Activando el servidor desde express
app.listen('3001', () => console.log('Servidor corriendo en el puerto 3001'));
