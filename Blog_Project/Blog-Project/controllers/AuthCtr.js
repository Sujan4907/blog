const User = require("../model/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { createToken } = require("../utils/generateToken");
const apiError = require("../utils/apiError");


exports.signup = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password } = req.body;


  const user = await User.create({
    firstname,
    lastname,
    email,
    password,
  });

  if (user) {
    res.status(201).json({ token: createToken(user._id), data: user });
  }
});


exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new apiError("Invalid Password or Email", 401));
  }
  if (user.isBlocked) {
    return next(new apiError("Your Account has been disabled", 403));
  }
  const token = createToken(user._id);

  delete user._doc.password;

  res.status(200).json({ token, data: user });
});
