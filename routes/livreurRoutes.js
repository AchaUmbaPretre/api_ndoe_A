const express = require('express');
const { getLivreurCount, getLivreur, postLivreur, deleteLivreur, putLivreur, putStatutCommande, putStatutCommandeLivre, getProvince, getCommune } = require("../controllers/livreurCtrl");
const router = express.Router();


router.get('/', getLivreur);
router.get('/livreurCount', getLivreurCount);
router.post('/', postLivreur);
router.delete('/:id', deleteLivreur);
router.put('/putLivreur/:id',putLivreur);

router.put('/putStatut/:id', putStatutCommande);
router.put('/putStatutLivre/:id', putStatutCommandeLivre);


router.get('/province', getProvince)
router.get('/commune/:id', getCommune)

module.exports = router;