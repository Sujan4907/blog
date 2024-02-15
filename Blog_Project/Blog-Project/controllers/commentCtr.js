const asyncHandler = require("express-async-handler");
const Comment = require("../model/Comment");
const Post = require("../model/Post");
const User = require("../model/User");
const handler = require("../controllers/handlersFactory");

exports.createComment = asyncHandler(async (req, res) => {
  const comment = await Comment.create(req.body);

  await Post.findByIdAndUpdate(
    req.post._id,
    {
      $addToSet: { comments: comment._id },
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { comments: comment._id },
    },
    { new: true }
  );

  res.status(201).json({ data: comment });
});

exports.updateComment = handler.updateOne(Comment, "comment");

exports.getComment = handler.getOne(Comment, "comment");

exports.allComments = handler.getAll(Comment);

exports.deleteComment = handler.deleteOne(Comment, "comment");
