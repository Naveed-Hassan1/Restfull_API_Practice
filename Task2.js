const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
require("dotenv").config();
const { User, Post, Comment } = require("./model/Task2model");

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

app.post("/api/users/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("posts");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//Second ONES
app.post("/api/posts", async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;
    const user = await User.findById(author);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.create({ title, content, author, tags });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "username email");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username email",
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comments = await Comment.find({ post: req.params.id }).populate(
      "user",
    );
    res.status(200).json({ post, comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/posts/tag/:tag", async (req, res) => {
  try {
    const posts = await Post.find({ tags: req.params.tag });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await Comment.deleteMany({ post: req.params.id });
    res.status(200).json({ message: "Post and comments deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//Third ONE 



app.post("/api/posts/:postId/comments", async (req, res) => {
  try {
    const { text, user } = req.body;
    const postExists = await Post.findById(req.params.postId);
    const userExists = await User.findById(user);
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }
    const comment = await Comment.create({
      text,
      post: req.params.postId,
      user
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get("/api/posts/:postId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({  post: req.params.postId }).populate("user");
    res.status(200).json(comments);
  } 
  catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.delete("/api/comments/:id", async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});