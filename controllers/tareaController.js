import mongoose from "mongoose"
import Tarea from '../models/Tarea.js'
import Proyecto from "../models/Proyecto.js"
import generarId from '../helpers/generarId.js'
import generarJWT from '../helpers/generarJWT.js'

const agregarTrarea = async (req,res) => {
    const { proyecto } = req.body
    const valid = mongoose.Types.ObjectId.isValid(proyecto)
    if(!valid){
        const error = new Error('id no valido');
        return res.status(401).json({ msg: error.message});
    }
    const existeProyecto = await Proyecto.findById(proyecto)
    if(!existeProyecto){
        const error = new Error('Proyecto no existe');
        return res.status(404).json({ msg: error.message});
    }
    if(existeProyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion invalidad');
        return res.status(403).json({ msg: error.message});
    }
    try {
        const tareaAlmacenada = await Tarea.create(req.body)
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }

}
const obtenerTarea = async (req,res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('id no valido');
        return res.status(401).json({ msg: error.message});
    }
    const tarea = await Tarea.findById(id).populate("proyecto")
    if(!tarea){
        const error = new Error('Tarea no existe');
        return res.status(404).json({ msg: error.message});
    }
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message});
    }
    res.json(tarea)
}
const actualizarTarea = async (req,res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('id no valido');
        return res.status(401).json({ msg: error.message});
    }
    const tarea = await Tarea.findById(id).populate("proyecto")
    if(!tarea){
        const error = new Error('Tarea no existe');
        return res.status(404).json({ msg: error.message});
    }
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message});
    }
    try {
        const tareaActualizada = await Tarea.findByIdAndUpdate(id, req.body ,{ new: true})
        res.json(tareaActualizada)
    } catch (error) {
        console.log(error)
    }
}
const eliminarTarea = async (req,res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('id no valido');
        return res.status(401).json({ msg: error.message});
    }
    const tarea = await Tarea.findById(id).populate("proyecto")
    if(!tarea){
        const error = new Error('Tarea no existe');
        return res.status(404).json({ msg: error.message});
    }
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message});
    }
    try {
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)
        await Promise.allSettled([ await proyecto.save(), await tarea.deleteOne()])
        res.json({ msg: "Tarea Eliminada"})
    } catch (error) {
        console.log(error)
    }
}
const cambiarEstado = async (req,res) => {
    const {id} = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('id no valido');
        return res.status(401).json({ msg: error.message});
    }
    const tarea = await Tarea.findById(id).populate("proyecto")
    if(!tarea){
        const error = new Error('Tarea no existe');
        return res.status(404).json({ msg: error.message});
    }
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message});
    }
    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    tarea.populate("completado", "nombre email")
    await tarea.save()
    res.json(tarea)
}

export{
    agregarTrarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}