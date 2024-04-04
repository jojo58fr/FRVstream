// Import des modules nécessaires
const express = require('express');
const bodyParser = require('body-parser');
const tmi = require('tmi.js');
var log4js = require("log4js");

const Database = require("./database");

// Initialisation de l'application Express
const app = express();

var logger = log4js.getLogger();
logger.level = "debug";
logger.debug("[FRVTUBERS-LISTVTUBERS] SERVER STARTED RUNNING");

Database.instance.initDatabase();

logger.debug("[FRVTUBERS-LISTVTUBERS] TRY INIT DB");


var listVtubers = require('./ListVtubers').instance;

// Configuration de body-parser pour analyser les requêtes JSON
app.use(bodyParser.json());

// Route de test
app.get('/', (req, res) => {
    res.send('Vtubers devs 4 the win !');
});

// Exemple de route pour une API
app.get('/api/v1/streamers', (req, res) => {

    logger.debug("[FRVTUBERS-LISTVTUBERS] GET /api/V1/streamers");

    let variable = listVtubers.getStreamers();

    res.json(variable);
});

// Lancement du serveur
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});