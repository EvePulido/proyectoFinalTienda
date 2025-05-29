const db = require('../lib/db');

const getClientes = (req, res) => {
    db.query(
        'SELECT id, nombre, apellidos, email FROM usuarios WHERE es_admin = 0',
        (err, result) => {
            if (err) {
                return res.status(500).send({ message: err });
            }
            res.status(200).send(result);
        }
    );
}

const getProductos = (req, res) => {
    db.query(
        'SELECT * FROM productos',
        (err, result) => {
            if (err) {
                return res.status(500).send({ message: err });
            }
            res.status(200).send(result);
        }
    );
}

const postProducto = (req, res) => {
    const { nombre, descripcion, precio, stock, imagen } = req.body;

    db.query(
        'INSERT INTO productos (nombre, descripcion, precio, stock, imagen) VALUES (?, ?, ?, ?, ?)',
        [nombre, descripcion, precio, stock, imagen],
        (err, result) => {
            if (err) {
                return res.status(400).send({ message: err });
            }
            res.status(201).send({ message: 'Producto agregado con éxito' });
        }
    );
}

const putProducto = (req, res) => {
    const id = req.params.id; // Obtiene el id del producto
    const { nombre, descripcion, precio, stock, imagen } = req.body; // Obtiene los nuevos datos

    db.query(
        'UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, imagen=? WHERE id=?',
        [nombre, descripcion, precio, stock, imagen, id], //Actualiza los datos
        (err, result) => {
            if (err) {
                return res.status(400).send({ message: err });
            }
            res.status(200).send({ message: 'Producto actualizado correctamente' });
        }
    );
}

module.exports = {
    getClientes,
    getProductos,
    postProducto,
    putProducto
}