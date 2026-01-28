const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const customerRoutes = require("./modules/customers/customer.routes");
const taskRoutes = require("./modules/tasks/task.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/customers", customerRoutes);
app.use("/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Mini CRM Backend is running 🚀",
  });
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
