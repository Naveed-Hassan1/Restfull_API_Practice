const express = require("express");
const mongoose = require("mongoose");
const std = require("./model/student");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(
    process.env.link,
  )
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(`Error come while connecting to DB {err}`));

app.listen(5000, () => console.log("Server is listening on port 5000"));

// POST — Add new student (validation handled by Mongoose schema)
app.post("/api/students", async (req, res) => {
  try {
    const student = await new std(req.body);
    await student.save();
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — All students with optional department filter & pagination
app.get("/api/students", async (req, res) => {
  try {
    const { department, page = 1, limit = 10 } = req.query;

    const filter = department ? { department } : {};
    const students = await std
      .find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// GET — Single student by ID
app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await std.findById(req.params.id);

    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — Search by name
app.get("/api/students/search", async (req, res) => {
  try {
    const { name } = req.query;
    const students = await std.find({
      name: { $regex: name, $options: "i" },
    });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT — Full update
app.put("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const student = await std.findByIdAndUpdate(id, req.body, {
      new: true,
      overwrite: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH — Partial update
app.patch("/api/students/:id", async (req, res) => {
  try {
    const student = await std.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE — Permanent delete
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await std.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH — Soft delete (deactivate)
app.patch("/api/students/:id/deactivate", async (req, res) => {
  try {
    const student = await std.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deactivated", student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
