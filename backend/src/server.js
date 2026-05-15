require("dotenv").config();
const app = require("./app");
const { testConnection } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server.");
  console.error("name:", error?.name);
  console.error("message:", error?.message);
  if (error?.code) console.error("code:", error.code);
  if (error?.detail) console.error("detail:", error.detail);
  if (error?.stack) console.error(error.stack);
  process.exit(1);
});
