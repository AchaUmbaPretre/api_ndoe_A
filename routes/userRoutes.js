const express = require("express");
const router = express.Router();
const { getUser, deleteUser, getUserOne, putUser, detailForgot, forgotUser } = require("../controllers/userCtrl");

router.get("/getUser", getUser);
router.get("/getUserOne/:id", getUserOne);
router.delete("/getUser/:id", deleteUser);
router.put("/getUser/:id", putUser);

router.post('/detail_forgot', detailForgot)
router.put('/password_reset/:id', forgotUser)
module.exports = router;