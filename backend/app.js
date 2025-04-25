const express = require("express");
const connectToDB = require("./config/connectToDb");
const { errorHandler, notFound } = require("./middlewares/error.js");
var cors = require("cors");
require("dotenv").config();

// Connection to DB
connectToDB();

// Init App
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // Allow frontend origin
    credentials: true, // Allow cookies in requests
  })
);

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoute.js"));
app.use("/api/users", require("./routes/usersRoute.js"));
app.use("/api/posts", require("./routes/postsRoute.js"));
app.use("/api/comments", require("./routes/commentsRoute.js"));
app.use("/api/categories", require("./routes/categoriesRoute.js"));
app.use("/api/admin", require("./routes/adminRoute.js"));

// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

// Running The Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});
