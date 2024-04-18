//Import
const express = require('express');
const app = express();
const PORT = 3000;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');

//Config
app.use(express.static('public'));
app.use('/processed', express.static('processed'));

//Server
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

//Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//Ruta de carga
app.post('/cargar', upload.single('imageFile'), async (req, res) => {
    try {
        if (!req.file && !req.body.imageUrl) {
            throw new Error('No se proporcionó una imagen');
        }
//Obtiene la ruta de la imagen
        const path = req.file ? req.file.path : req.body.imageUrl;
        
//JIMP
        const image = await Jimp.read(path);
        const processedImage = await image
            .greyscale() 
            .resize(350, Jimp.AUTO);

//UUID4
        const outputPath = `processed/${uuidv4()}.jpeg`;
        await processedImage.writeAsync(outputPath);
        
//HTML
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
        <a href="/" class="back-button">Volver</a>
        </body>
        </html>`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: pude que la imagen no exista o hubo un problema al cargarla. Revisa el link.');
    }
});