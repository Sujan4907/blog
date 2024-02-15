const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Post = require("./Post");

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "First Name is Required"],
    },

    lastname: {
      type: String,
      required: [true, "Last Name is Required"],
    },

    image: {
      type: String,
    },

    email: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Email is Required"],
    },

    password: {
      type: String,
      required: [true, "Password is Required"],
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    plan: {
      type: String,
      enum: ["Free", "Premium", "Pro"],
      default: "Free",
    },

    userAward: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      default: "Bronze",
    },
  },
  { toJSON: { virtuals: true } },
  { timestamps: true }
);

UserSchema.virtual("fullname").get(function () {
  return `${this.firstname} ${this.lastname}`;
});

UserSchema.virtual("intials").get(function () {
  return `${this.firstname[0]}${this.lastname[0]}`;
});

UserSchema.virtual("postCounts").get(function () {
  return this.posts.length;
});

UserSchema.virtual("followersCount").get(function () {
  return this.followers.length;
});

UserSchema.virtual("followingCount").get(function () {
  return this.following.length;
});

UserSchema.virtual("viewersCount").get(function () {
  return this.viewers.length;
});

UserSchema.virtual("blockedCount").get(function () {
  return this.blocked.length;
});

UserSchema.pre("findOne", async function (next) {
  const userId = this._conditions._id;
  const posts = await Post.find({ author: userId });

  if (posts.length > 0) {
    const lastPostDate = posts[posts.length - 1].createdAt;
    const lastPostDateStr = lastPostDate.toDateString();
    UserSchema.virtual("lastPostDate").get(function () {
      return lastPostDateStr;
    });
    const currentDate = new Date();

    const diff = (currentDate - lastPostDate) / (1000 * 3600 * 24);

    if (diff > 30) {
      UserSchema.virtual("isInactive").get(function () {
        return true;
      });
      await User.findByIdAndUpdate(userId, { isBlocked: true }, { new: true });
    } else {
      UserSchema.virtual("isInactive").get(function () {
        return false;
      });
      await User.findByIdAndUpdate(userId, { isBlocked: false }, { new: true });
    }
    const daysAgo = Math.floor(diff);
    UserSchema.virtual("lastActive").get(function () {
      if (daysAgo <= 0) {
        return "today";
      } else if (daysAgo === 1) {
        return "yeterday";
      } else {
        return `${daysAgo} days ago`;
      }
    });
    if (posts.length < 10) {
      await User.findByIdAndUpdate(
        userId,
        { userAward: "Bronze" },
        { new: true }
      );
    } else if (posts.length < 20) {
      await User.findByIdAndUpdate(
        userId,
        { userAward: "Silver" },
        { new: true }
      );
    } else {
      await User.findByIdAndUpdate(
        userId,
        { userAward: "Gold" },
        { new: true }
      );
    }
  }
  next();
});
UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
const User = mongoose.model("User", UserSchema);
module.exports = User;
