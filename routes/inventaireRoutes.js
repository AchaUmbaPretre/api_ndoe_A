const express = require("express");
const { getInventaire, getInventaireOne} = require("../controllers/inventaire");
const router = express.Router();



router.get("/:id", getInventaire);
router.get("/inventaireTotalOne/:id", getInventaireOne);

module.exports = router;