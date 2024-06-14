const express = require('express');
const cors = require('cors');
const colors = require('colors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const produitRoutes = require('./routes/produitRoutes');
const inventaireRoutes = require('./routes/inventaireRoutes');
const clientRoutes = require('./routes/clientRoutes');
const commandeRoutes = require('./routes/commandeRoutes');
const livraisonRoutes = require('./routes/livraisonRoutes');
const livreurRoutes = require('./routes/livreurRoutes');
const venteRoutes = require('./routes/venteRoutes');
const RapportRoutes = require('./routes/rapportRoutes');
const DepensesRoutes = require('./routes/depensesRoutes');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();

dotenv.config();


// Configuration de l'environnement de développement
const environment = process.env.PORT || 'development';

if (environment === 'development') {
  // Activer l'affichage des erreurs détaillées dans les journaux
  const morgan = require('morgan');
  app.use(morgan('dev'));
}


app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.setMaxListeners(0);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/client", clientRoutes);
app.use('/api/produit', produitRoutes);
app.use('/api/inventaire', inventaireRoutes);
app.use('/api/commande', commandeRoutes);
app.use('/api/livraison', livraisonRoutes);
app.use('/api/livreur', livreurRoutes);
app.use('/api/vente', venteRoutes);
app.use('/api/rapport', RapportRoutes);
app.use('/api/depenses', DepensesRoutes);

const port = process.env.PORT || 8080;


// Gestionnaire d'erreurs global pour les erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
  // Logique supplémentaire de gestion des erreurs si nécessaire

  // Arrêter l'application de manière contrôlée
  process.exit(1);
});

// Gestionnaire d'erreurs global pour les rejets de promesse non gérés
process.on('unhandledRejection', (reason, promise) => {
  console.log('Rejet de promesse non géré:', reason);

  process.exit(1);
});

app.listen(port, () => {
  console.log(
    `Le serveur est connecté au port ${port}`.bgCyan.white
  );
});