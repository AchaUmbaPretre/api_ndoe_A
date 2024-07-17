const express = require("express");
const { getClient, getClientCount, postClient, deleteClient, putClient, getClientOne, getClientAdresse, postClientAdresse, deleteClientAdresse, getClientAdresseOne, getClientTelephone, postClientTelephone, getClientTelephoneOne, putLocation, getClientCountJour, getClientCountJour7, getClientCountJour30, getClientCount1an, getClientCountHier, getClientRapport } = require("../controllers/clientCtrl");
const router = express.Router();

router.get('/', getClient)
router.get('/client_rapport', getClientRapport)
router.get('/:id', getClientOne)
router.get('/clientCount/count', getClientCount)
router.get('/clientCount/countJour', getClientCountJour)
router.get('/clientCount/countHier', getClientCountHier)
router.get('/clientCount/countJour7', getClientCountJour7)
router.get('/clientCount/countJour30', getClientCountJour30)
router.get('/clientCount/count1an', getClientCount1an)
router.post('/client', postClient)
router.put('/clientDelete/:id', deleteClient)
router.put('/client/:id', putClient)

router.get('/clientAdresse', getClientAdresse)
router.get('/clientAdresse/:id_client', getClientAdresseOne)
router.post('/clientAdresse', postClientAdresse)
router.delete('/clientAdresse/:id', deleteClientAdresse)


router.get('/clientTelephone', getClientTelephone)
router.get('/clientTelephone/:id_client', getClientTelephoneOne)
router.post('/clientTelephone', postClientTelephone)

router.put('/clientLocation/:id', putLocation)


module.exports = router;