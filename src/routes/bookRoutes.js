const express = require("express");
const {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook
} = require("../controllers/bookController");

const router = express.Router();

router.get("/", getAllBooks);
router.post("/", createBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);
router.post("/:id/borrow", borrowBook);
router.post("/:id/return", returnBook);

module.exports = router;
