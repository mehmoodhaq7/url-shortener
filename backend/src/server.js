if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.BACKEND_PORT || 3000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Version: ${process.env.APP_VERSION || "v1"}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

start();
