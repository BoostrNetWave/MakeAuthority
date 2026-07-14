const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to memory database");
});

afterAll(async () => {
  // Clean up test database after all tests
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log("✅ Test database cleaned and connection closed");
});

// Set test environment variables
process.env.JWT_SECRET         = "test_jwt_secret_boostr_2026";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_boostr_2026";
process.env.NODE_ENV           = "test";
process.env.GOOGLE_CLIENT_ID   = "mock_google_id";
process.env.GOOGLE_CLIENT_SECRET = "mock_google_secret";
process.env.LINKEDIN_CLIENT_ID   = "mock_linkedin_id";
process.env.LINKEDIN_CLIENT_SECRET = "mock_linkedin_secret";
