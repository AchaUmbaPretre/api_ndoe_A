const express = require("express");
const { getInventaire, getInventaireOne, menusAll, menusAllPermission, getMenu, permissions, getPermissions, PostUserPermission, putPermission} = require("../controllers/inventaire");
const router = express.Router();


router.get("/:id", getInventaire);
router.get("/inventaireTotalOne/:id", getInventaireOne);

router.get('/menuAll/add', menusAll)
router.get('/menuAllPermission', menusAllPermission)
router.get('/', getMenu)

router.get('/permissions/One', permissions)
router.get('/user-permissions', getPermissions)
router.post('/user-permissions', PostUserPermission)
router.put('/:userId/permissions/:optionId', putPermission)

module.exports = router;