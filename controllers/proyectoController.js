import mongoose from "mongoose"
import Proyecto from "../models/Proyecto.js"
import Usuario from "../models/Usuario.js"
import Tarea from '../models/Tarea.js'


const obtenerProyectos = async (req,res) => {
    const proyectos = await Proyecto.find({
        '$or':[
            {'colaboradores': {$in: req.usuario}},
            {'creador': {$in: req.usuario}}
        ]
    }).select("-tareas -fechaEntrega")

    res.json(proyectos)
}
const nuevoProyecto = async (req,res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id
    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}
const obtenerProyecto = async (req,res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('id no valido');
        return res.status(401).json({ msg: error.message});
    }
    const proyecto = await Proyecto.findById(id).populate({path : 'tareas', populate: {path: 'completado', select: 'nombre'}}).populate('colaboradores', "nombre email")
    if(!proyecto){
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ msg: error.message});
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message});
    }
    res.json(proyecto)
    
}
const editarProyecto = async (req,res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('id no valido');
        return res.status(401).json({ msg: error.message});
    }
    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ msg: error.message});
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message});
    }
    try {
        const proyectoActualizar = await Proyecto.findByIdAndUpdate(id, req.body,{ new: true})
        res.json(proyectoActualizar)

    } catch (error) {
        console.log(error)
    }

}
const eliminarProyecto = async (req,res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('id no valido');
        return res.status(401).json({ msg: error.message});
    }
    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ msg: error.message});
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message});
    }
    try {
        await Tarea.deleteMany({ "proyecto" : id})
        await proyecto.deleteOne()
        res.json({ msg: "Proyecto Eliminado"})
    } catch (error) {
        console.log(error)
    }
}
const agregarColaborador = async (req,res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('id no valido');
        return res.status(401).json({ msg: error.message});
    }
    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        const error = new Error('No existe Proyecto');
        return res.status(404).json({ msg: error.message});
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message});
    }
    const {email} = req.body
    const usuario = await Usuario.findOne({email}).select('-confirmado -updatedAt -createdAt -password -token -__v')
    if(!usuario){
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({ msg: error.message});
    }
    if(proyecto.creador.toString() === usuario._id.toString()){
        const error = new Error('El creador del proyecto no puede ser colaborador');
        return res.status(401).json({ msg: error.message});
    }
    if(proyecto.colaboradores.includes(usuario._id)){
        const error = new Error('El usuario ya pertenece al proyecto');
        return res.status(401).json({ msg: error.message});
    }
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({msg: 'Colaborador agregado correctamente'})
}
const eliminarColaborador = async (req,res) => {
    const { id } = req.params
    const valid = mongoose.Types.ObjectId.isValid(id)
    if(!valid){
        const error = new Error('id no valido');
        return res.status(401).json({ msg: error.message});
    }
    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        const error = new Error('No existe Proyecto');
        return res.status(404).json({ msg: error.message});
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no valida');
        return res.status(403).json({ msg: error.message});
    }
    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()
    res.json({msg: 'Colaborador Eliminado del proyecto'})

}
const buscarColaborador = async (req,res) => {
    const {email} = req.body
    const usuario = await Usuario.findOne({email}).select('-confirmado -updatedAt -createdAt -password -token -__v')
    if(!usuario){
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({ msg: error.message});
    }
    res.json(usuario)
}
export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador
}