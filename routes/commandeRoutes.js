const express = require("express");
const { getDemandeCommande, getDemandeCommandeCount, postDemandeCommande, deleteDemandeCommande, getCommandeCount, getCommande, postCommande, deleteCommande, getStatus, putCommande, getCommandeOne, getDemandeCommandeAll, getIdVariantProduit, getCommande7jrs, getCommandeJour, getCommandeEchange, getCommande30Jours, getCommande1an, getCommandeHier,RapportCommandeCountMoney, getCommandeCountJour, getCommandeCount7Jour, getCommandeRapportFiltrer } = require("../controllers/commandeCtrl");
const router = express.Router();


//Rapport commande topbar
router.get('/commandeRapportTopbar', RapportCommandeCountMoney)

//commande
router.get('/', getCommande)
router.get('/commande_rapport', getCommandeRapportFiltrer)
router.get('/commandeEchange', getCommandeEchange)
router.get('/commandeJourCount', getCommandeCountJour)
router.get('/commande7JourCount', getCommandeCount7Jour)
router.get('/commandeJour', getCommandeJour)
router.get('/commandeHier', getCommandeHier)
router.get('/commande7', getCommande7jrs)
router.get('/commande30', getCommande30Jours)
router.get('/commande1an', getCommande1an)
router.get('/commandeOne/:id', getCommandeOne)
router.get('/commandeCount', getCommandeCount)
router.post('/commandePost', postCommande)
router.put('/commandePut/:id', putCommande)
router.delete('/commande/:id', deleteCommande)

//Status
router.get('/statut', getStatus)

//Taille Commande
router.get('/idVariantproduit/:idCode/:idTaille',getIdVariantProduit)

router.get('/detail-commande', getDemandeCommande)
router.get('/detail-commande/:id', getDemandeCommandeAll)
router.get('/detail-commandeCount', getDemandeCommandeCount)
router.post('/detail-commande', postDemandeCommande)
router.delete('/detail-commande/:id', deleteDemandeCommande)



module.exports = router;