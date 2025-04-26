const express = require("express");
const connectToDB = require("./config/connectToDb");
const xss = require("xss-clean");
const rateLimiting = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const { errorHandler, notFound } = require("./middlewares/error.js");
var cors = require("cors");
require("dotenv").config();

// Connection to DB
connectToDB();

// Init App
const app = express();


// Middlewares
app.use(express.json());

// Security Headers(helmet)
app.use(helmet());

// Prevent Http Param Pollution
app.use(hpp());

// Prevent XSS(Cross Site Scripting) Attacks
app.use(xss());

// Rate Limit
app.use(rateLimiting({
  windowMs: 10 * 60 * 1000,
  max: 200
}));

// Cors Policy
app.use(
  cors({
    origin: "http://localhost:3000", // Allow frontend origin
    credentials: true, // Allow cookies in requests
  })
);

// Routes
app.use("/api/auth", require("./routes/authRoute.js"));
app.use("/api/users", require("./routes/usersRoute.js"));
app.use("/api/posts", require("./routes/postsRoute.js"));
app.use("/api/comments", require("./routes/commentsRoute.js"));
app.use("/api/categories", require("./routes/categoriesRoute.js"));
app.use("/api/admin", require("./routes/adminRoute.js"));
app.use("/api/password", require("./routes/passwordRoute.js"));

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
