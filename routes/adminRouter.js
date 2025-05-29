const express = require('express');
const router = express.Router(); // Objeto touters
const adminMiddleware = require('../middleware/admin'); // middleware

const { getClientes, getProductos, postProducto, putProducto } = require('../controllers/adminController');

router.get('/clientes', adminMiddleware.isAdmin, getClientes); // Obtener todos los clientes
router.get('/productos', adminMiddleware.isAdmin, getProductos); // Obtener todos los productos
router.post('/productos', adminMiddleware.isAdmin, postProducto); // Agregar producto
router.put('/productos/:id', adminMiddleware.isAdmin, putProducto); // Modificar producto

module.exports = router;
