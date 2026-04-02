const Student = require("../models/Student");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (username === adminUsername && password === adminPassword) {
      return res.status(200).json({
        message: "Login successful",
        token: "demo-admin-token",
        admin: { username: adminUsername }
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const studentLogin = async (req, res) => {
  try {
    const { studentId, password, name } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({ message: "Student ID and password are required" });
    }

    const normalizedStudentId = String(studentId).trim();
    const normalizedPassword = String(password).trim();
    const normalizedName = String(name || "").trim();

    let student = await Student.findOne({ studentId: normalizedStudentId });

    // Auto-register first-time students for assignment simplicity.
    if (!student) {
      if (!normalizedName) {
        return res.status(400).json({ message: "Name is required for first-time student login" });
      }
      student = await Student.create({
        studentId: normalizedStudentId,
        name: normalizedName,
        password: normalizedPassword
      });
    } else if (student.password !== normalizedPassword) {
      return res.status(401).json({ message: "Invalid student credentials" });
    }

    return res.status(200).json({
      message: "Student login successful",
      token: `student-token-${student.studentId}`,
      student: {
        studentId: student.studentId,
        name: student.name
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Student login failed", error: error.message });
  }
};

module.exports = { login, studentLogin };
