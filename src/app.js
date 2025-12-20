require("dotenv").config();
const express = require("express");
const usersRoutes = require("./routes/users");

const app = express();
app.use(express.json());

app.use("/api/users", usersRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
