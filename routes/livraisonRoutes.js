const express = require("express");
const { getLivraison, getLivraisonOne, postLivraison, deleteLivraison, getLivraisonDetail, getLivraisonDetailOne, postLivraisonDetail, deleteLivraisonDetail, getLivraisonUser, getLivraisonUserDetail, putLivraisonVuLivreur, getLivraisonUserOne, getLivraisonDetailPrix, putLivraisonDetailPrix, getLivraisonDetailJour, getLivraisonNbreJour, getLivraisonNbreDuJour7, getLivraisonNbreDuJour30, getLivraisonNbreDuJour1an, getLivraisonNbreDuJours, getLivraisonNbreDHier, getLivraisonDetailRapportFiltrer } = require("../controllers/livraisonCtrl");
const router = express.Router();



router.get("/", getLivraison);
router.get("/livraison_rapport", getLivraisonDetailRapportFiltrer);
router.get("/livraisonNbreDuJours", getLivraisonNbreDuJours);
router.get("/livraisonNbreDHier", getLivraisonNbreDHier);
router.get("/livraisonNbreDuJour7", getLivraisonNbreDuJour7);
router.get("/livraisonNbreDuJour30", getLivraisonNbreDuJour30);
router.get("/livraisonNbreDuJour1an", getLivraisonNbreDuJour1an);
router.get("/livraisonOne/:id", getLivraisonOne);
router.post("/", postLivraison);
router.delete("/livraisonDelete/:id", deleteLivraison);

//Detail livraison
router.get("/livraisonDetail", getLivraisonDetail);
router.get("/livraisonDetailJour", getLivraisonDetailJour);
router.get("/livraisonNbreJour", getLivraisonNbreJour);
router.get("/livraisonDetailOne/:id", getLivraisonDetailOne);
router.post("/livraisonDetail", postLivraisonDetail);
router.delete("/livraisonDeleteDetail/:id", deleteLivraisonDetail);

//Livraison Prix
router.get("/livraisonPrix/:id",getLivraisonDetailPrix);
router.put("/livraisonPrix/:id",putLivraisonDetailPrix);

//livraison utilisateur
router.get("/livraison-user/:id",getLivraisonUser);
router.get("/livraison-userOne/:id",getLivraisonUserOne);
router.get("/livraison-user-detail/:id",getLivraisonUserDetail);

router.put("/vuLivreur/:id",putLivraisonVuLivreur);


module.exports = router;