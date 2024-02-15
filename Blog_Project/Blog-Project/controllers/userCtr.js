const User = require("../model/User");
const Post = require("../model/Post");
const Comment = require("../model/Comment");
const Category = require("../model/Category");
const handlers = require("./handlersFactory");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const apiError = require("../utils/apiError");
const storage = require("../config/cloudinary");
const multer = require("multer");
const { selectFields } = require("express-validator/src/select-fields");
const upload = multer({ storage: storage });
exports.uploadProfileImage = upload.single("profile");
exports.createUser = handlers.createOne(User);
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      firstname: req.body.firstname,
      lastname: req.body.firstname,
      email: req.body.email,
    },
    { new: true }
  )
  res.status(200).json({ data: user });
});
exports.changeUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 10),
    },
    { new: true }
  );
  res.status(200).json({ data: user });
});
exports.allUsers = handlers.getAll(User);
exports.getUser = handlers.getOne(User, "user");
exports.deleteUser = handlers.deleteOne(User, "user");
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  const posts = await Post.deleteMany({ author: userId });
  const comment = await Comment.deleteMany({ user: userId });
  const category = await Category.deleteMany({ user: userId });
  user.delete();
  res.status(204).send();
});
exports.profilePhotoUpload = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user._id);
  if (!user) {
    return next(new apiError("User not found!", 404));
  }
  if (user.isBlocked) {
    return next(new apiError("Access Blocked!", 403));
  }
  if (req.file) {
    user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { image: req.file.path } },
      {
        new: true,
      }
    );
    res.status(200).json({ message: "Successfully uploaded", data: user });
  }
});
exports.whoViewMyProfile = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(new apiError("Action Denied!", 403));
  }
  if (!(await User.findById(req.params.id))) {
    return next(new apiError("User Not Found!", 403));
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { viewers: req.params.id } },
    { new: true }
  ).populate({ path: "viewers" });
  res.status(200).json({ data: user.viewers });
});
exports.following = asyncHandler(async (req, res, next) => {
  const B = await User.findById(req.params.id);
  const A = await User.findById(req.user._id);
  if (req.user._id.toString() === req.params.id.toString()) {
    return next(new apiError("Access Denied!", 403));
  }
  if (A && B) {
    const isUserAlreadyFollowed = A.following.find(
      (follower) => follower.toString() === B._id.toString()
    );
    if (isUserAlreadyFollowed) {
      return next(new apiError("You already followed this user"));
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $addToSet: { following: B._id },
        },
        { new: true }
      );
      await User.findByIdAndUpdate(
        req.params.id,
        {
          $addToSet: { followers: A._id },
        },
        { new: true }
      );
      res.json({
        status: "success",
        data: "You have successfully follow this user",
      });
    }
  } else {
    return next(new apiError("User that you trying to follow not found!", 403));
  }
});
exports.Unfollowing = asyncHandler(async (req, res, next) => {
  const A = await User.findById(req.user._id);
  const B = await User.findById(req.params.id);
  if (A && B) {
    const isUserAlreadyFollowed = A.following.find(
      (follower) => follower.toString() === B._id.toString()
    );
    if (!isUserAlreadyFollowed) {
      return next(new apiError("You have not followed this user"));
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: B._id },
        },
        { new: true }
      );
      await User.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { followers: A._id },
        },
        { new: true }
      );
      res.json({
        status: "success",
        data: "You have successfully unfollow this user",
      });
    }
  } else {
    return next(
      new apiError("User that you trying to follow sas not found!", 403)
    );
  }
});
exports.block = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const userToBeBlocked = await User.findById(req.params.id);
  if (user && userToBeBlocked) {
    const isUserAlreadyBlocked = user.blocked.find(
      (user) => user.toString() === userToBeBlocked._id.toString()
    );
    if (isUserAlreadyBlocked) {
      return next(new apiError("You already blocked this user", 403));
    }
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { blocked: userToBeBlocked._id } },
      { new: true }
    );
    res.status(200).json({
      message: "You have successfully blocked this user",
    });
  } else {
    return next(
      new apiError("User that you trying to block was not found!", 403)
    );
  }
});
exports.unblock = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const userToBeunBlock = await User.findById(req.params.id);

  if (user && userToBeunBlock) {
    const isUserAlreadyBlocked = user.blocked.find(
      (user) => user.toString() === userToBeunBlock._id.toString()
    );
    if (!isUserAlreadyBlocked) {
      return next(new apiError("You have not blocked this user", 403));
    }
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { blocked: userToBeunBlock._id } },
      { new: true }
    );
    res.status(200).json({
      message: "You have successfully unblocked this user",
    });
  } else {
    return next(
      new apiError("User that you trying to unblock was not found!", 403)
    );
  }
});
exports.block_admin = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: true },
    { new: true }
  );
  if (!user) {
    return next(new apiError(`No user for this id ${req.params.id}`, 404));
  }
  res
    .status(200)
    .json({ message: "You Successfully block this user", data: user });
});
exports.unblockUser_admin = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: false },
    { new: true }
  );
  if (!user) {
    return next(new apiError(`No user for this id ${req.params.id}`, 404));
  }
  res
    .status(200)
    .json({ message: "You Successfully unblock this user", data: user });
});
