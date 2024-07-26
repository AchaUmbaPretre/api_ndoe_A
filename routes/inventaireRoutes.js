const express = require("express");
const { getInventaire, getInventaireOne, menusAll, permissions, putPermission, menusAllOne} = require("../controllers/inventaire");
const router = express.Router();


router.get("/:id", getInventaire);
router.get("/inventaireTotalOne/:id", getInventaireOne);

router.get('/menuAll/addOne', menusAllOne)
router.get('/menuAll/add', menusAll)

router.get('/permissions/One', permissions)
router.put('/inventaireUpdate/:userId/permissions/add/:optionId', putPermission)

module.exports = router;