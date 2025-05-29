const express = require('express');
const router = express.Router(); // Crea un objeto router
const userMiddleware = require('../middleware/users.js'); // Importa el middleware

const { postSignUp, postLogin, getTienda, getProductos, getPedidos, postPedido} = require ('../controllers/userController');

router.post('/sign-up', userMiddleware.validateRegister, postSignUp); // Valida los datos antes de entrar a la función
router.post('/login', postLogin); // Login usuarios
router.get('/tienda', userMiddleware.isLoggedIn, getTienda); // Ruta protegida que verifica el token y responde para cargar la interfaz
router.get('/productos', getProductos); // Consulta los productos en la bd
router.get('/pedidos/:userId', userMiddleware.isLoggedIn, getPedidos); // Obtiene los pedidos del usuario
router.post('/pedido', userMiddleware.isLoggedIn, postPedido); // Crea un nuevo pedido

module.exports = router;