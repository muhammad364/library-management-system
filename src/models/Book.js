const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      trim: true,
      default: "General"
    },
    isbn: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    borrowedCount: {
      type: Number,
      min: 0,
      default: 0
    },
    borrowedBy: [
      {
        studentName: {
          type: String,
          trim: true
        },
        studentId: {
          type: String,
          trim: true
        },
        borrowedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    availability: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
