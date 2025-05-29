const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Rutas usuarios
const router = require('./routes/router.js');
app.use('/api', router);

// Rutas de administrador
const adminRouter = require('./routes/adminRouter.js');
app.use('/api/admin', adminRouter); 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});