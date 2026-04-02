const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Book = require("../src/models/Book");
const Student = require("../src/models/Student");

dotenv.config();

const books = [
  {
    title: "Peer-e-Kamil",
    author: "Umera Ahmed",
    category: "Urdu Literature",
    isbn: "9789690016793",
    quantity: 8,
    availability: true
  },
  {
    title: "Aab-e-Hayat",
    author: "Umera Ahmed",
    category: "Urdu Literature",
    isbn: "9789690016809",
    quantity: 5,
    availability: true
  },
  {
    title: "Umrao Jan Ada",
    author: "Mirza Hadi Ruswa",
    category: "Urdu Classic",
    isbn: "9789690016816",
    quantity: 4,
    availability: true
  },
  {
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell, Peter Norvig",
    category: "Computer Science",
    isbn: "9780134610993",
    quantity: 6,
    availability: true
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Software Engineering",
    isbn: "9780132350884",
    quantity: 10,
    availability: true
  },
  {
    title: "Computer Networking: A Top-Down Approach",
    author: "James F. Kurose, Keith W. Ross",
    category: "Computer Science",
    isbn: "9780136681557",
    quantity: 7,
    availability: true
  }
];

const students = [
  { name: "Ali Raza", studentId: "BSCS-24123", password: "student123" },
  { name: "Ayesha Khan", studentId: "BSE-24011", password: "student123" },
  { name: "Hamza Tariq", studentId: "BIT-23991", password: "student123" }
];

const seed = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    await Book.deleteMany({});
    await Student.deleteMany({});
    await Book.insertMany(books);
    await Student.insertMany(students);
    console.log("Seed complete: inserted demo books and students");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seed();
