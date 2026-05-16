const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Book = require("../src/models/Book");

let mongoServer, app;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  app = require("../server");
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => { await Book.deleteMany({}); });

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

test("GET /health should return ok", async () => {
  const res = await request(app).get("/health");
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe("ok");
});

test("POST /api/books should create a book", async () => {
  const payload = {
    title: "Clean Code", author: "Robert Martin",
    category: "CS", isbn: "TEST-001", quantity: 5
  };
  const res = await request(app).post("/api/books").send(payload);
  expect(res.statusCode).toBe(201);
  const saved = await Book.findOne({ isbn: payload.isbn });
  expect(saved).not.toBeNull();
});
