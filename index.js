import express from 'express'
import dotenv from 'dotenv'
import Cors from 'cors'
import conectarDB from './config/db.js'
import usuarioRouter from './routes/usuarioRouter.js'
import proyectoRouter from './routes/proyectoRouter.js'
import tareaRouter from './routes/tareaRouter.js'


const app = express()
app.use(express.json())
dotenv.config()
conectarDB()
// configuracion cors
const whitelist = [process.env.FRONTEND_URL];
const corsOptions = {
 origin: function(origin, callback){
    if(whitelist.includes(origin)){
        callback(null, true);
    }else{
        callback(new Error("Error de cors"));
    }
 }
}
app.use(Cors(corsOptions));
//routing
app.use('/api/usuarios', usuarioRouter )
app.use('/api/proyectos', proyectoRouter )
app.use('/api/tareas', tareaRouter)

const PORT = process.env.PORT || 4000
const servidor = app.listen(PORT, () => {
    console.log(`Servidro corriendo en el puerto ${PORT}`)
})

// socket.io

import {Server} from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,

    }
})

io.on('connection', (socket) => {
    // definir eventos envio(emit) respues(on)
    socket.on('abrir proyecto', (proyecto) => {
        socket.join(proyecto)
    })
    socket.on('nueva tarea', (tarea) => {
        socket.to(tarea.proyecto).emit('tarea agregada', tarea)
    })
    socket.on('eliminar tarea',(tarea) => {
        socket.to(tarea.proyecto).emit('tarea eliminada', tarea)
    })
    socket.on('actualizar tarea', (tarea) => {
        socket.to(tarea.proyecto).emit('tarea actualizada', tarea)
    })
    socket.on('cambiar estado', (tarea) => {
        socket.to(tarea.proyecto._id).emit('tarea estado', tarea)
    })
    socket.on('eliminado', (id) => {
        socket.to(id).emit('fue eliminado', id)
    })
    // manejo colaboradores
    socket.on('pagina', (res) => {
        socket.join(res)
    })
    socket.on('novedades', correo => {
        socket.to('logeado').emit('update', correo)
    })
})