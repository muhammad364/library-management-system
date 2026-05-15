const Book = require("../models/Book");

const buildAvailability = (quantity, borrowedCount) => quantity - borrowedCount > 0;

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
};

const createBook = async (req, res) => {
  try {
    const { title, author, category, isbn, quantity } = req.body;

    if (!title || !author || quantity === undefined) {
      return res.status(400).json({ message: "Title, author and quantity are required" });
    }

    const normalizedQuantity = Number(quantity);
    const availability = buildAvailability(normalizedQuantity, 0);
    const normalizedIsbn = isbn && String(isbn).trim() ? String(isbn).trim() : undefined;

    const book = await Book.create({
      title,
      author,
      category,
      isbn: normalizedIsbn,
      quantity: normalizedQuantity,
      borrowedCount: 0,
      borrowedBy: [],
      availability
    });

    res.status(201).json(book);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "ISBN already exists" });
    }
    res.status(500).json({ message: "Failed to create book", error: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const existingBook = await Book.findById(id);

    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    const nextQuantity =
      updateData.quantity !== undefined ? Number(updateData.quantity) : existingBook.quantity;

    if (nextQuantity < existingBook.borrowedCount) {
      return res
        .status(400)
        .json({ message: "Quantity cannot be less than currently borrowed copies" });
    }

    updateData.quantity = nextQuantity;
    updateData.availability = buildAvailability(nextQuantity, existingBook.borrowedCount);

    if (updateData.isbn !== undefined) {
      const normalizedIsbn = String(updateData.isbn).trim();
      updateData.isbn = normalizedIsbn ? normalizedIsbn : undefined;
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json(updatedBook);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "ISBN already exists" });
    }
    res.status(500).json({ message: "Failed to update book", error: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete book", error: error.message });
  }
};

const borrowBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, studentId } = req.body;

    if (!studentName || !studentId) {
      return res.status(400).json({ message: "Student name and student ID are required" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const currentBorrowedCount = Number(book.borrowedCount || 0);
    if (book.quantity - currentBorrowedCount <= 0) {
      return res.status(400).json({ message: "No copies available for borrowing" });
    }

    book.borrowedBy.push({
      studentName: String(studentName).trim(),
      studentId: String(studentId).trim()
    });
    book.borrowedCount = currentBorrowedCount + 1;
    book.availability = buildAvailability(book.quantity, book.borrowedCount);

    await book.save();
    return res.status(200).json({ message: "Book borrowed successfully", book });
  } catch (error) {
    return res.status(500).json({ message: "Failed to borrow book", error: error.message });
  }
};

const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required to return a book" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const normalizedStudentId = String(studentId).trim().toLowerCase();
    const matchedIndex = book.borrowedBy.findIndex(
      (entry) => entry.studentId.toLowerCase() === normalizedStudentId
    );

    if (matchedIndex === -1) {
      return res.status(404).json({ message: "No active borrowing found for this Student ID" });
    }

    // Remove only one borrowed copy for the student per return request.
    book.borrowedBy.splice(matchedIndex, 1);
    book.borrowedCount = Math.max(0, book.borrowedBy.length);
    book.availability = buildAvailability(book.quantity, book.borrowedCount);

    await book.save();
    return res.status(200).json({ message: "Book returned successfully", book });
  } catch (error) {
    return res.status(500).json({ message: "Failed to return book", error: error.message });
  }
};

module.exports = {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook
};
