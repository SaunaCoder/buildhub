require("dotenv").config();
const express = require("express");
const buildRoutes = require("./routes/builds");
const userRoutes = require("./routes/users");

const app = express();
app.use(express.json());

app.use("/builds", buildRoutes);
app.use("/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
