const express = require("express");
const router = express.Router();

const {
  createUser,
  updateUser,
  allUsers,
  getUser,
  deleteUser,
  profilePhotoUpload,
  uploadProfileImage,
  whoViewMyProfile,
  following,
  Unfollowing,
  block,
  unblock,
  block_admin,
  unblockUser_admin,
  changeUserPassword,
  deleteAccount,
} = require("./../controllers/userCtr");

const {
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  getUserValidator,
  getAllUserValidator,
  whoViewMyProfileValidator,
  followValidator,
  changeUserPasswordValidator,
} = require("../utils/validators/userValidator");

const { requireSignIn, alowedTo } = require("../middlwares/authMiddlwares");

router.post(
  "/",
  requireSignIn,
  alowedTo("admin"),
  createUserValidator,
  createUser
);

router.put(
  "/",
  requireSignIn,
  alowedTo("admin", "user"),
  updateUserValidator,
  updateUser
);

router.put(
  "/change-password",
  requireSignIn,
  alowedTo("user", "admin"),
  changeUserPasswordValidator,
  changeUserPassword
);

router.delete(
  "/delete-account",
  requireSignIn,
  alowedTo("user", "admin"),
  deleteAccount
);

router.delete(
  "/:id",
  requireSignIn,
  alowedTo("admin"),
  deleteUserValidator,
  deleteUser
);

router.get("/", allUsers);

router.get("/:id", getUserValidator, getUser);

router.post(
  "/profile-photo-upload",
  requireSignIn,
  alowedTo("user", "admin"),
  uploadProfileImage,
  profilePhotoUpload
);

router.get(
  "/profile-viewers/:id",
  requireSignIn,
  alowedTo("user"),
  whoViewMyProfileValidator,
  whoViewMyProfile
);

router.get(
  "/following/:id",
  requireSignIn,
  alowedTo("user"),
  followValidator,
  following
);

router.get(
  "/unfollow/:id",
  requireSignIn,
  alowedTo("user"),
  followValidator,
  Unfollowing
);

router.get(
  "/block/:id",
  requireSignIn,
  alowedTo("user"),
  followValidator,
  block
);

router.get(
  "/unblock/:id",
  requireSignIn,
  alowedTo("user"),
  followValidator,
  unblock
);

router.get(
  "/admin-block/:id",
  requireSignIn,
  alowedTo("admin"),
  followValidator,
  block_admin
);

router.get(
  "/admin-unblock/:id",
  requireSignIn,
  alowedTo("admin"),
  followValidator,
  unblockUser_admin
);

module.exports = router;
