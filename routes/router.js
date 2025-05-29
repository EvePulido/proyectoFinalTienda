const express = require('express');
const router = express.Router(); // Crea un objeto router
const bcrypt = require('bcryptjs'); // Encriptar
const jwt = require('jsonwebtoken');
const db = require('../lib/db.js'); // Importa la conexión a la bd
const userMiddleware = require('../middleware/users.js'); // Importa el middleware

// Valida los datos antes de entrar a la función
router.post('/sign-up', userMiddleware.validateRegister, (req, res, next) => {
  db.query( // Consulta para ver si ya está registrado el email
    'SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?)',
    [req.body.email],
    (err, result) => {
      if (result && result.length) { // Si hay resultado
        return res.status(409).send({
          message: 'El email ya está en uso', // Ya está en uso
        });
      } else { // Si no hay resultado (no existe)
        bcrypt.hash(req.body.password, 10, (err, hash) => { // Encripta la contraseña
          if (err) {
            return res.status(500).send({
              message: err,
            });
          } else {
            // Define esAdmin según lo que venga en req.body.es_admin
            let esAdmin;
            if (req.body.es_admin === 1) {
              esAdmin = 1;
            } else {
              esAdmin = 0; // para que MySQL use el valor por defecto
            }

            db.query( // Inserta el usuario en la BD
              'INSERT INTO usuarios (apellidos, nombre, password, es_admin, direccion, telefono, email) VALUES (?, ?, ?, ?, ?, ?, ?);',
              [
                req.body.apellidos,
                req.body.nombre,
                hash,
                esAdmin,
                req.body.direccion,
                req.body.telefono,
                req.body.email,
              ],
              (err, result) => {
                if (err) {
                  return res.status(400).send({
                    message: err,
                  });
                }
                return res.status(201).send({
                  message: 'Registro exitoso',
                });
              }
            );
          }
        });
      }
    }
  );
});

// Login usuarios/admin
router.post('/login', (req, res, next) => {
  db.query(
    `SELECT * FROM usuarios WHERE email = ?;`, // Busca en la BD los datos del usuario
    [req.body.email],
    (err, result) => {
      if (err) {
        return res.status(400).send({
          message: err,
        });
      }
      if (!result.length) { // Verifica que el usuario exista
        return res.status(400).send({
          message: 'Correo o contraseña incorrectos', // Si no, manda un error
        });
      }
      bcrypt.compare( // Compara la contraseña enviada con la encriptada
        req.body.password,
        result[0]['password'],
        (bErr, bResult) => {
          if (bErr) {
            return res.status(400).send({ // Si no son iguales
              message: 'Correo o contraseña incorrectos',
            });
          }
          if (bResult) {
            // Si las contraseñas coinciden
            const token = jwt.sign( //Crea un  token
              {
                email: result[0].email,
                userId: result[0].id,
                es_admin: result[0].es_admin,
              },
              'SECRETKEY',
              { expiresIn: '7d' }
            );
            return res.status(200).send({ // Responde con éxito y manda datos del usuario
              message: 'Inicio de sesión exitoso',
              token,
              user: result[0],
            });
          }
          return res.status(400).send({
            message: 'Correo o contraseña incorrectos',
          });
        }
      );
    }
  );
});

// Ruta protegida que verifica el token y responde para cargar la interfaz
router.get('/tienda', userMiddleware.isLoggedIn, (req, res) => {
  res.status(200).json({
    "estado": 200,
  });
});

// Consulta los productos en la bd
router.get('/productos', (req, res) => {
  db.query(
    `SELECT * FROM productos`,
    (err, result) => {
      if (err) {
        return res.status(500).send({
          message: 'Error al obtener los productos',
          error: err,
        });
      }
      return res.status(200).send({
        message: 'Productos obtenidos correctamente',
        productos: result,
      });
    }
  );
});

// Obtiene los pedidos del usuario
router.get('/pedidos/:userId', userMiddleware.isLoggedIn, (req, res) => { // Valida el token
  const userId = parseInt(req.params.userId);
  const token = req.userData.userId;
  if (userId !== token) {
    return res.status(403).send({ message: 'No autorizado para ver estos pedidos.' });
  }
  // Consulta y devuleve los pedidos del usuario
  db.query('SELECT * FROM pedidos WHERE usuario_id = ?', [userId], (err, result) => {
    if (err) {
      return res.status(500).send({
        message: 'Error al obtener los pedidos',
        error: err,
      });
    }
    return res.status(200).send({
      pedidos: result,
    });
  });
});

// Crea un nuevo pedidp
router.post('/pedido', userMiddleware.isLoggedIn, (req, res) => { // Valida el token
  const usuarioId = req.userData.userId; // Obtiene el id del usuario y su carrito
  const carrito = req.body.productos;

  if (!Array.isArray(carrito) || carrito.length === 0) { // Valida que el carrito no esté vació
    return res.status(400).send({ message: 'Carrito vacío.' });
  }
  
  const totalPedido = carrito.reduce((acum, producto) =>   // Calcular total del pedido
    acum + producto.precio_unitario * producto.cantidad, 0);

  // Insertar pedido
  db.query(
    'INSERT INTO pedidos (usuario_id, total, pagado) VALUES (?, ?, 0)',
    [usuarioId, totalPedido],
    (errorPedido, resultadoPedido) => {
      if (errorPedido) {
        return res.status(500).send({
          message: 'Error guardando pedido.',
          error: errorPedido.sqlMessage || errorPedido.message || errorPedido
        });
      }
      const idPedido = resultadoPedido.insertId; // Guarda el id del pedido

      // Preparar valores para insertar detalles del pedido
      const detallesPedido = carrito.map(producto => [
        idPedido,
        producto.id,
        producto.cantidad,
        producto.precio_unitario,
      ]);

      // Insertar detalles
      db.query(
        'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES ?',
        [detallesPedido],
        (errorDetalles) => {
          if (errorDetalles) {
            const mensajeError = errorDetalles.sqlMessage || 'Error guardando detalles.';
            return res.status(500).send({ message: mensajeError });
          }

          res.status(201).send({ message: 'Pedido creado.' });
        }
      );
    }
  );
});

module.exports = router;