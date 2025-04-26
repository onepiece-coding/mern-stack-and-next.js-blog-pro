const router = require("express").Router();
const {
  registerUserCtrl,
  loginUserCtrl,
  logoutUserCtrl,
  verifyUserAccountCtrl,
} = require("../controllers/authController.js");
const { verifyTokenAndOnlyUser } = require("../middlewares/verifyToken.js");

// /api/auth/register
router.post("/register", registerUserCtrl);

// /api/auth/login
router.post("/login", loginUserCtrl);

// /api/auth/logout
router.post("/logout", verifyTokenAndOnlyUser, logoutUserCtrl);

// /api/auth/:userId/verify/:token
router.post("/:userId/verify/:token", verifyUserAccountCtrl);


module.exports = router;
