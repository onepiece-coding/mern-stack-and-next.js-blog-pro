const router = require("express").Router();
const { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl } = require("../controllers/categoriesController.js");
const validateObjectId = require("../middlewares/validateObjectId.js");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken.js");

// /api/categories
router.route("/")
      .post(verifyTokenAndAdmin, createCategoryCtrl)
      .get(getAllCategoriesCtrl);

// /api/categories/:id
router.route("/:id").delete(validateObjectId, verifyTokenAndAdmin, deleteCategoryCtrl);

module.exports = router;