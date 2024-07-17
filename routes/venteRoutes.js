const express = require("express");
const { getVente, postVente, deleteVente, putVente, postVenteRetour, getVenteOne, getVenteCount, getDette, deleteDette, putDette, getPaiement, deletePaiement, postPaiement, getDetteOne, envoiEmail, getOptions, postEchangeLivraison, getDetteRapport, getDetteJour, getDetteJour7, getDetteJour30, postVenteEchange, getDettePaiement, getVenteAjour, getPaiementJour, getPaiementJour7, getPaiementJour30, getDetteRapportNbreJour, getDetteRapportNbreJour7, getDetteRapportNbreJour30, getVenteAjour7, getVenteAjour30, getVenteAjour1an, getVenteCountDuJour, getPaiementJourMontant, getPaiementJourMontant7, getPaiementJourMontant30, getPaiementJourMontant1an, getDetteRapportNbreJour1an, getVenteHier, getPaiementHier, getDetteRapportNbreHier, getPaiementHierMontant,getVenteRapports, getDetteRapports, getPaiementRapport } = require("../controllers/venteCtrl");
const router = express.Router();



router.get('/', getVente)
router.get('/venteDuJour', getVenteAjour)
router.get('/venteNbreJour', getVenteCountDuJour)
router.get('/venteDhier', getVenteHier)
router.get('/venteDuJour7', getVenteAjour7)
router.get('/venteDuJour30', getVenteAjour30)
router.get('/venteDuJour1an', getVenteAjour1an)
router.get('/venteCount',getVenteCount)
router.get('/:id', getVenteOne)
router.get('/vente_rapport/rapport', getVenteRapports)
router.post('/', postVente)
router.post('/venteMail', envoiEmail)
router.post('/retour', postVenteRetour)
router.delete('/:id', deleteVente)
router.put('/:id', putVente)

//Dette
router.get('/vente/dette', getDette)
router.get('/vente/dette_rapport', getDetteRapports)
router.get('/vente/dettePaiement', getDettePaiement)
router.get('/vente/detteJour', getDetteJour)
router.get('/vente/detteJour7', getDetteJour7)
router.get('/vente/detteJour30', getDetteJour30)
router.get('/vente/detteRapport', getDetteRapport)
router.get('/vente/detteRapportJour', getDetteRapportNbreJour)
router.get('/vente/detteRapportHier', getDetteRapportNbreHier)
router.get('/vente/detteRapport7jours', getDetteRapportNbreJour7)
router.get('/vente/detteRapport30jours', getDetteRapportNbreJour30)
router.get('/vente/detteRapport1an', getDetteRapportNbreJour1an)
router.get('/vente/detteOne', getDetteOne)
router.delete('/vente/dette/:id', deleteDette)
router.put('/vente/dette/:id', putDette)

//Paiement
router.get('/vente/paiement',getPaiement)
router.get('/vente/paiement_rapport',getPaiementRapport)
router.get('/vente/paiementJour',getPaiementJour)
router.get('/vente/paiementHier',getPaiementHier)
router.get('/vente/paiementJour7', getPaiementJour7)
router.get('/vente/paiementJour30', getPaiementJour30)
router.get('/vente/paiementJourMontant', getPaiementJourMontant)
router.get('/vente/paiementHierMontant', getPaiementHierMontant)
router.get('/vente/paiementJourMontant7', getPaiementJourMontant7)
router.get('/vente/paiementJourMontant30', getPaiementJourMontant30)
router.get('/vente/paiementJourMontant1an', getPaiementJourMontant1an)
router.post('/vente/paiement',postPaiement)
router.delete('/vente/paiement/:id',deletePaiement)


//OPTIONS
router.get('/options/side', getOptions)

//Echange
router.post('/echangeLivraison',postEchangeLivraison)
router.put('/echange/:idEchange/:idDetail/:idVariant',postVenteEchange)

module.exports = router;