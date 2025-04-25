const router = require("express").Router();
const {
  registerUserCtrl,
  loginUserCtrl,
  logoutUserCtrl,
  getMe,
} = require("../controllers/authController.js");
const { verifyToken } = require("../middlewares/verifyToken.js");

// /api/auth/register
router.post("/register", registerUserCtrl);

// /api/auth/login
router.post("/login", loginUserCtrl);

// /api/auth/me
router.get("/me", verifyToken, getMe);

// /api/auth/logout
router.post("/logout", logoutUserCtrl);

module.exports = router;
