import express from 'express';

const app = express();
const PORT = 3000;


/* Rutas - GET - POST */
app.get('/', (req, res) => {
  res.send('200, todo ok');
});

app.listen(PORT, () => {
    console.log(`[+]Servidor encendido -> http://localhost:{$PORT}`);
});