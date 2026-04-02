const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const adminPanel = document.getElementById("adminPanel");
const studentPanel = document.getElementById("studentPanel");
const studentLoginSection = document.getElementById("studentLoginSection");
const studentDashboardSection = document.getElementById("studentDashboardSection");
const adminTabBtn = document.getElementById("adminTabBtn");
const studentTabBtn = document.getElementById("studentTabBtn");
const loginForm = document.getElementById("loginForm");
const studentLoginForm = document.getElementById("studentLoginForm");
const logoutBtn = document.getElementById("logoutBtn");
const studentLogoutBtn = document.getElementById("studentLogoutBtn");
const bookForm = document.getElementById("bookForm");
const booksContainer = document.getElementById("booksContainer");
const studentBooksContainer = document.getElementById("studentBooksContainer");
const messageBox = document.getElementById("messageBox");
const studentMessageBox = document.getElementById("studentMessageBox");
const studentWelcome = document.getElementById("studentWelcome");
const formTitle = document.getElementById("formTitle");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const totalTitles = document.getElementById("totalTitles");
const availableCopies = document.getElementById("availableCopies");
const borrowedCopies = document.getElementById("borrowedCopies");

let authToken = localStorage.getItem("library_token") || null;
let studentToken = localStorage.getItem("student_token") || null;
let currentStudent = JSON.parse(localStorage.getItem("student_profile") || "null");
let editingBookId = null;
let booksCache = [];

const API = {
  login: "/api/auth/login",
  studentLogin: "/api/auth/student-login",
  books: "/api/books"
};

const showMessage = (target, message, type = "success") => {
  target.textContent = message;
  target.className = `message ${type}`;
  setTimeout(() => {
    target.className = "message hidden";
    target.textContent = "";
  }, 3000);
};

const switchTab = (tab) => {
  const adminActive = tab === "admin";
  adminPanel.classList.toggle("hidden", !adminActive);
  studentPanel.classList.toggle("hidden", adminActive);
  adminTabBtn.classList.toggle("active", adminActive);
  studentTabBtn.classList.toggle("active", !adminActive);
  if (!adminActive) {
    updateStudentUI();
  }
};

const updateAuthUI = () => {
  if (authToken) {
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
  } else {
    dashboardSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
  }
};

const updateStudentUI = () => {
  const isLoggedIn = Boolean(studentToken && currentStudent);
  studentLoginSection.classList.toggle("hidden", isLoggedIn);
  studentDashboardSection.classList.toggle("hidden", !isLoggedIn);
  if (isLoggedIn) {
    studentWelcome.textContent = `Welcome ${currentStudent.name} (${currentStudent.studentId})`;
  }
};

const renderStats = (books) => {
  const total = books.length;
  const available = books.reduce((sum, book) => sum + Math.max(book.quantity - book.borrowedCount, 0), 0);
  const borrowed = books.reduce((sum, book) => sum + (book.borrowedCount || 0), 0);
  totalTitles.textContent = String(total);
  availableCopies.textContent = String(available);
  borrowedCopies.textContent = String(borrowed);
};

const createMeta = (book) =>
  `Author: ${book.author}<br/>Category: ${book.category || "General"}<br/>ISBN: ${
    book.isbn || "N/A"
  }<br/>Total: ${book.quantity} | Available: ${Math.max(book.quantity - book.borrowedCount, 0)}`;

const renderAdminBooks = (books) => {
  if (!books.length) {
    booksContainer.innerHTML = "<p>No books found. Add your first title.</p>";
    return;
  }

  booksContainer.innerHTML = books
    .map(
      (book) => `
      <article class="book-card">
        <h4 class="book-title">${book.title}</h4>
        <p class="book-meta">${createMeta(book)}</p>
        <div class="pill-row">
          <span class="pill available-pill">Available: ${Math.max(book.quantity - book.borrowedCount, 0)}</span>
          <span class="pill borrowed-pill">Borrowed: ${book.borrowedCount || 0}</span>
        </div>
        <div class="book-actions">
          <button onclick="startEdit('${book._id}')">Edit</button>
          <button class="danger" onclick="removeBook('${book._id}')">Delete</button>
        </div>
      </article>
    `
    )
    .join("");
};

const renderStudentBooks = (books) => {
  if (!books.length) {
    studentBooksContainer.innerHTML = "<p>No books available in the library yet.</p>";
    return;
  }

  studentBooksContainer.innerHTML = books
    .map(
      (book) => `
      <article class="book-card">
        <h4 class="book-title">${book.title}</h4>
        <p class="book-meta">${createMeta(book)}</p>
        <div class="pill-row">
          <span class="pill available-pill">Available: ${Math.max(book.quantity - book.borrowedCount, 0)}</span>
          <span class="pill borrowed-pill">Borrowed: ${book.borrowedCount || 0}</span>
        </div>
        <div class="book-actions">
          <button onclick="borrowBook('${book._id}')" ${book.quantity - book.borrowedCount <= 0 ? "disabled" : ""}>
            Borrow
          </button>
          <button class="btn-secondary" onclick="returnBook('${book._id}')">Return</button>
        </div>
      </article>
    `
    )
    .join("");
};

const fetchBooks = async () => {
  try {
    const response = await fetch(API.books);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch books");
    }
    booksCache = data;
    renderAdminBooks(data);
    renderStudentBooks(data);
    renderStats(data);
  } catch (error) {
    showMessage(messageBox, error.message, "error");
    showMessage(studentMessageBox, error.message, "error");
  }
};

const clearBookForm = () => {
  bookForm.reset();
  document.getElementById("quantity").value = 1;
  editingBookId = null;
  formTitle.textContent = "Add New Book";
  cancelEditBtn.classList.add("hidden");
};

const populateBookForm = (book) => {
  document.getElementById("title").value = book.title;
  document.getElementById("author").value = book.author;
  document.getElementById("category").value = book.category || "";
  document.getElementById("isbn").value = book.isbn || "";
  document.getElementById("quantity").value = book.quantity;
  editingBookId = book._id;
  formTitle.textContent = "Edit Book";
  cancelEditBtn.classList.remove("hidden");
};

window.startEdit = (id) => {
  const book = booksCache.find((item) => item._id === id);
  if (!book) {
    showMessage(messageBox, "Book not found", "error");
    return;
  }
  populateBookForm(book);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.removeBook = async (id) => {
  if (!confirm("Delete this book?")) return;

  try {
    const response = await fetch(`${API.books}/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete book");
    showMessage(messageBox, data.message || "Book deleted");
    if (editingBookId === id) clearBookForm();
    fetchBooks();
  } catch (error) {
    showMessage(messageBox, error.message, "error");
  }
};

const getStudentPayload = () => ({
  studentName: currentStudent?.name || "",
  studentId: currentStudent?.studentId || ""
});

window.borrowBook = async (id) => {
  if (!studentToken || !currentStudent) {
    showMessage(studentMessageBox, "Please login as a student first", "error");
    return;
  }
  const payload = getStudentPayload();

  try {
    const response = await fetch(`${API.books}/${id}/borrow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Borrow failed");
    showMessage(studentMessageBox, data.message || "Book borrowed");
    fetchBooks();
  } catch (error) {
    showMessage(studentMessageBox, error.message, "error");
  }
};

window.returnBook = async (id) => {
  if (!studentToken || !currentStudent) {
    showMessage(studentMessageBox, "Please login as a student first", "error");
    return;
  }
  const payload = getStudentPayload();

  try {
    const response = await fetch(`${API.books}/${id}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: payload.studentId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Return failed");
    showMessage(studentMessageBox, data.message || "Book returned");
    fetchBooks();
  } catch (error) {
    showMessage(studentMessageBox, error.message, "error");
  }
};

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(API.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");
    authToken = data.token;
    localStorage.setItem("library_token", authToken);
    updateAuthUI();
    showMessage(messageBox, "Login successful");
    fetchBooks();
  } catch (error) {
    showMessage(messageBox, error.message, "error");
  }
});

logoutBtn.addEventListener("click", () => {
  authToken = null;
  localStorage.removeItem("library_token");
  clearBookForm();
  updateAuthUI();
});

studentLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    name: document.getElementById("studentLoginName").value.trim(),
    studentId: document.getElementById("studentLoginId").value.trim(),
    password: document.getElementById("studentLoginPassword").value
  };

  try {
    const response = await fetch(API.studentLogin, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Student login failed");

    studentToken = data.token;
    currentStudent = data.student;
    localStorage.setItem("student_token", studentToken);
    localStorage.setItem("student_profile", JSON.stringify(currentStudent));
    studentLoginForm.reset();
    updateStudentUI();
    showMessage(studentMessageBox, "Student login successful");
  } catch (error) {
    showMessage(studentMessageBox, error.message, "error");
  }
});

studentLogoutBtn.addEventListener("click", () => {
  studentToken = null;
  currentStudent = null;
  localStorage.removeItem("student_token");
  localStorage.removeItem("student_profile");
  updateStudentUI();
});

bookForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    title: document.getElementById("title").value.trim(),
    author: document.getElementById("author").value.trim(),
    category: document.getElementById("category").value.trim(),
    isbn: document.getElementById("isbn").value.trim(),
    quantity: Number(document.getElementById("quantity").value)
  };

  const method = editingBookId ? "PUT" : "POST";
  const url = editingBookId ? `${API.books}/${editingBookId}` : API.books;

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to save book");
    showMessage(messageBox, editingBookId ? "Book updated" : "Book added");
    clearBookForm();
    fetchBooks();
  } catch (error) {
    showMessage(messageBox, error.message, "error");
  }
});

cancelEditBtn.addEventListener("click", clearBookForm);
adminTabBtn.addEventListener("click", () => switchTab("admin"));
studentTabBtn.addEventListener("click", () => switchTab("student"));

updateAuthUI();
updateStudentUI();
fetchBooks();
