const express = require("express");
const router = express.Router();

const {
  createCategoryValidator,
  deleteCategoryValidator,
  updateCategoryValidator,
  getCategoryValidator,
} = require("./../utils/validators/categoryValidator");

const {
  createCategory,
  updateCategory,
  allCategories,
  getCategory,
  deleteCategory,
} = require("./../controllers/categoryCtr");

const { requireSignIn, alowedTo } = require("../middlwares/authMiddlwares");

router.post(
  "/",
  requireSignIn,
  alowedTo("admin"),
  createCategoryValidator,
  createCategory
);

router.put(
  "/:id",
  requireSignIn,
  alowedTo("admin"),
  updateCategoryValidator,
  updateCategory
);

router.get("/", allCategories);

router.get("/:id", getCategoryValidator, getCategory);

router.delete(
  "/:id",
  requireSignIn,
  alowedTo("admin"),
  deleteCategoryValidator,
  deleteCategory
);

module.exports = router;
