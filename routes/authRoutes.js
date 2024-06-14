const express = require("express");
const { registerController, loginController, logout } = require("../controllers/authCtrl");
const router = express.Router();



router.post('/register',registerController )
router.post('/login', loginController)
router.post('/logout', logout);

module.exports = router;