const express = require("express");
const { getInventaire, getInventaireOne, menusAll, menusAllPermission, getMenu, permissions, getPermissions, PostUserPermission, putPermission, menusAllOne} = require("../controllers/inventaire");
const router = express.Router();


router.get("/:id", getInventaire);
router.get("/inventaireTotalOne/:id", getInventaireOne);

router.get('/menuAll/addOne', menusAllOne)
router.get('/menuAll/add', menusAll)
router.get('/menuAllPermission', menusAllPermission)
router.get('/', getMenu)

router.get('/permissions/One', permissions)
router.get('/user-permissions', getPermissions)
router.post('/user-permissions', PostUserPermission)
router.put('/inventaireUpdate/:userId/permissions/add/:optionId', putPermission)

module.exports = router;