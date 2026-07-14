require("dotenv").config();
const connectDB = require("./src/db/db");
const app = require("./src/app");
const startCronJobs = require("./src/jobs/cron");


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
  console.log(`Boostr server running on http://localhost:${PORT}`);
  startCronJobs();
  });
});
// triggered nodemon restart
