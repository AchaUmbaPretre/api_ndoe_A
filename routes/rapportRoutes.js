const express = require("express");
const { getRapportVente, getRapportVenteAll, getRapportVenteSearch, getRapportVenteClient, getRapportVenteClientOne, getRapportRevenu, getRapportAchats, getAchatsTotal, getAchatsTotalDuel, getVenteTotal, getAchatsMois, getVenteMois, getRapportVenteV, getRapportVenteVariante, getRapportMarqueCount, getRapportVenteClientAll, getRapportVenteCouleur, getRapportVenteJour, getRapportVente7Jour, getRapportCouleurAll, getRapportVente30Jour, getRapportCouleurTaille, getRapportDateRecente, getRapportVenteAllRap, getRapportRevenuRapDuMois, getRapportDateRecente7Jours, getRapportDateRecenteJour30jours, getRapportDateRecenteJour, getVenteTotalDuJour, getVenteTotalDuJour7, getVenteTotalDuJour30, getVenteTotal1an, getVenteTotalDHier, getRapportDateRecenteMarque, getRapportRevenuAllDays, getRapportVenteCat, getRapportVenteAllCat, getRapportVenteAllRapCat, getDepenseRapportGraphique } = require("../controllers/rapportCtrl");
const router = express.Router();

//Rapport de vente
router.get('/rapport/venteV', getRapportVenteV);
router.get('/rapport/venteRecent', getRapportDateRecente);
router.get('/rapport/venteRecentMarque', getRapportDateRecenteMarque);
router.get('/rapport/venteRecentJour', getRapportDateRecenteJour);
router.get('/rapport/venteRecent7jours', getRapportDateRecente7Jours);
router.get('/rapport/venteRecent30jours', getRapportDateRecenteJour30jours);
router.get('/rapport/venteJour', getRapportVenteJour);
router.get('/rapport/vente7Jour', getRapportVente7Jour);
router.get('/rapport/vente30Jours', getRapportVente30Jour);
router.get('/rapport/venteV/:code_variant', getRapportVenteVariante);

//Rapport vente par marque
router.get("/rapport/vente", getRapportVente);
router.get("/rapport/venteAll/:id_marque", getRapportVenteAll);
router.get("/rapport/venteAllCat", getRapportVenteAllCat);
router.get("/rapport/venteAllRap/:id_marque", getRapportVenteAllRap);
router.get("/rapport/venteAllRapCat", getRapportVenteAllRapCat);

router.get("/rapport/venteAllSearch", getRapportVenteSearch);

//Rapport vente par Categorie
router.get("/rapport/venteCat", getRapportVenteCat);

//Rapport par couleur
router.get("/rapport/venteCouleur", getRapportVenteCouleur);
router.get("/rapport/venteCouleurAll", getRapportCouleurAll);

//Rapport par taille
router.get("/rapport/venteCouleurTaille", getRapportCouleurTaille);

//Rapport total de marque
router.get("/rapport/marqueCount", getRapportMarqueCount);

//Rapport vente client
router.get("/rapportClient/venteClient", getRapportVenteClient);
router.get("/rapportClient/venteClientAll", getRapportVenteClientAll);
router.get("/rapportClient/:clientId", getRapportVenteClientOne);
router.get("/rapportRevenu/revenu", getRapportRevenu)
router.get("/rapportRevenu/revenuAllDay", getRapportRevenuAllDays)
router.get("/rapportRevenu/revenuRapDuMois", getRapportRevenuRapDuMois)
router.get("/rapportAchats/achats", getRapportAchats)

//Achats total
router.get("/achatsTotal/total", getAchatsTotal)
router.get("/achatsTotalDuel/total", getAchatsTotalDuel)
router.get("/venteTotal/total", getVenteTotal)
router.get("/venteTotal/totalJour", getVenteTotalDuJour)
router.get("/venteTotal/totalHier", getVenteTotalDHier)
router.get("/venteTotal/totalJour7", getVenteTotalDuJour7)
router.get("/venteTotal/totalJour30", getVenteTotalDuJour30)
router.get("/venteTotal/totalJour1an", getVenteTotal1an)

//Rapport du mois
router.get("/rapportAchatsMois/total", getAchatsMois)
router.get("/rapportVenteMois/total", getVenteMois)

//Rapport Dépense
router.get("/depense-rapport-global", getDepenseRapportGraphique)


module.exports = router;