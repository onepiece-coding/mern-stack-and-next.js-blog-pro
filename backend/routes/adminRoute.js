const { getAllInfo } = require("../controllers/adminController");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const router = require("express").Router();

// /api/admin/info
router.get("/info", verifyTokenAndAdmin, getAllInfo);

module.exports = router;
