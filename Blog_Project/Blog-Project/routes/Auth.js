const express = require("express");
const router = express.Router();

const { signup, login } = require("./../controllers/AuthCtr");
const {
  signupValidator,
  loginValidator,
} = require("./../utils/validators/authValidator");

router.post("/signup", signupValidator, signup);

router.get("/login", loginValidator, login);

module.exports = router;
