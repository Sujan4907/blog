const express = require("express");
const router = express.Router();

const {
  createComment,
  updateComment,
  getComment,
  allComments,
  deleteComment,
} = require("../controllers/commentCtr");

const {
  createCommentValidator,
  updateCommentValidator,
  getCommentValidator,
  deleteCommentValidator,
} = require("../utils/validators/commentValidator");

const { requireSignIn, alowedTo } = require("../middlwares/authMiddlwares");

router.post(
  "/",
  requireSignIn,
  alowedTo("user", "admin"),
  createCommentValidator,
  createComment
);

router.put(
  "/:id",
  requireSignIn,
  alowedTo("user", "admin"),
  updateCommentValidator,
  updateComment
);

router.delete(
  "/:id",
  requireSignIn,
  alowedTo("user", "admin"),
  deleteCommentValidator,
  deleteComment
);

router.get("/:id", getCommentValidator, getComment);

router.get("/", allComments);

module.exports = router;
