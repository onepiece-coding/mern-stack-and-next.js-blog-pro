const router = require("express").Router();
const { getAllInfo } = require("../controllers/adminController");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");

// /api/admin/info
router.get("/info", verifyTokenAndAdmin, getAllInfo);

module.exports = router;
