//Imports
const express = require('express');
const app = express();
const PORT = 3000;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');

//Middleware
app.use(express.static('public'));
app.use('/processed', express.static('processed'));

//Inicia el server
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

//Pag inicio
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//Ruta para img POST
app.post('/cargar', upload.single('imageFile'), async (req, res) => {
    try {
        const path = req.file ? req.file.path : req.body.imageUrl;
        const image = await Jimp.read(path);
        const processedImage = await image
            .greyscale()
            .resize(350, Jimp.AUTO);

        const outputPath = `processed/${uuidv4()}.jpeg`;
        await processedImage.writeAsync(outputPath);
        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Imagen Procesada</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
        <img src="${outputPath}" class="fullscreen-image">
        <br>
        <button onclick="window.history.back();" class="back-button">Volver</button>
        </body>
        </html>`);
//Errors
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al procesar la imagen');
    }
});