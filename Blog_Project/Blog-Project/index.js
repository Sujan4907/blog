const express = require("express");
const app = express();

const apiError = require("./utils/apiError");
const { globalErrHandler } = require("./utils/globalErrHandler");

require("dotenv").config();


require("./config/database");

app.use(express.json()); 

const userRouters = require("./routes/User");
const authRouters = require("./routes/Auth");
const categoryRouters = require("./routes/Category");
const postRouters = require("./routes/Post");
const commentRouters = require("./routes/Comment");

app.use("/api/users", userRouters);
app.use("/api/auth", authRouters);
app.use("/api/categories", categoryRouters);
app.use("/api/posts", postRouters);
app.use("/api/comments", commentRouters);

app.all("*", (req, res, next) => {

  const err = new apiError(`Can't find this route ${req.originalUrl}`, 400);

  next(err);
});

app.use(globalErrHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
