import express  from "express";
const router = express.Router()
import { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevaPassword, perfil } from '../controllers/usuarioController.js'
import checkAuth from "../middleware/checkAuth.js";


router.post('/', registrar) //crea nuevo usuario
router.post('/login', autenticar)
router.get('/confirmar/:token', confirmar)
router.post('/olvide-password', olvidePassword)
router.route('/olvide-password/:token').get(comprobarToken).post(nuevaPassword)
router.get('/perfil', checkAuth, perfil)

export default router