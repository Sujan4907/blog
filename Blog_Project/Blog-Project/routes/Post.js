const express = require("express");
const router = express.Router();

const {
  createPost,
  updatePost,
  allPosts,
  getPost,
  deletePost,
} = require("../controllers/postCtr");

const {
  requireSignIn,
  alowedTo,
  isBlocked,
} = require("../middlwares/authMiddlwares");

const {
  createPostValidator,
  removePostValidator,
  updatePostValidator,
  getPostValidator,
} = require("../utils/validators/postValidator");

router.post(
  "/",
  requireSignIn,
  alowedTo("admin", "user"),
  isBlocked,
  createPostValidator,
  createPost
);

router.put(
  "/:id",
  requireSignIn,
  alowedTo("admin", "user"),
  updatePostValidator,
  updatePost
);

router.get("/", requireSignIn, alowedTo("admin", "user"), allPosts);

router.get(
  "/:id",
  requireSignIn,
  alowedTo("admin", "user"),
  getPostValidator,
  getPost
);
router.delete(
  "/:id",
  requireSignIn,
  alowedTo("admin", "user"),
  removePostValidator,
  deletePost
);

module.exports = router;
