const express = require("express");
const { getCatDepense, postCatDepense, deleteCatDepense, getDepense, postDepense, deleteDepense, depenseTotal, caisseVenteCount, caisseCommandeCount, caisseLivraisonNbreDuJours, caisseClientCount, caisseMouvementCountJour, caisseDetteRapportNbreJour, caissePaiementJourMontant, getDepenseDate,getDepenseJour,getDepenseHier,getDepense7jours,getDepense30jours,getDepense1an,caisseDepenseTotalCount } = require("../controllers/depensesCtrl");
const router = express.Router();



router.get('/catDepenses',getCatDepense )
router.post('/catDepenses',postCatDepense)
router.delete('/catDepenses/:id',deleteCatDepense)

router.get('/',getDepense )
router.get('/depenseOne',getDepenseDate )
router.get('/depenseDuJour',getDepenseJour )
router.get('/depenseDhier',getDepenseHier )
router.get('/depense7jours',getDepense7jours)
router.get('/depense30jours',getDepense30jours )
router.get('/depense1an',getDepense1an )
router.post('/',postDepense)
router.delete('/:id',deleteDepense)

router.get('/depenseCount',depenseTotal)
//Caisse
router.get('/caisseVenteCount',caisseVenteCount )
router.get('/caisseCommandeCount',caisseCommandeCount)
router.get('/caisseLivraisonCount', caisseLivraisonNbreDuJours)
router.get('/caisseClientCount',caisseClientCount)
router.get('/caisseMouvementCount',caisseMouvementCountJour )
router.get('/caisseDetteCount',caisseDetteRapportNbreJour )
router.get('/caissePaiementCount',caissePaiementJourMontant )
router.get('/caisseDepenseCount',caisseDepenseTotalCount )

module.exports = router;