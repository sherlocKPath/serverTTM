const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const crypto = require("crypto");

// สร้าง token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

const mongoose = require("mongoose");
mongoose
  .connect("mongodb+srv://petchza10222:1652038zc@peth.3o5dx.mongodb.net/Concert")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  key: { type: String, required: true },
  k: { type: String, required: false }
});

const User = mongoose.model("User", UserSchema);

// Login Endpoint
app.post("/api/login", async (req, res) => {
  const { email, key, k } = req.body;

  try {
    const user = await User.findOne({ email, key });
    if (user) {
      // หาก token ไม่ตรง ให้ทำการอัปเดต
      if (user.k !== k) {
        user.k = k; // อัปเดต token ใหม่
        await user.save();
      }

      return res.json({
        success: true,
        message: "Login successful",
        subscription: {
          email: user.email,
          key: user.key,
          k: user.k, // ส่ง token ที่อัปเดต
        },
      });
    } else {
      return res.status(401).json({ error: "Invalid email or key" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
});


// Signup Endpoint
app.post("/api/signup", async (req, res) => {
  const { email, key } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate a unique token for `k`
    const k = generateToken();

    // Create a new user
    const newUser = new User({ email, key, k });
    await newUser.save();

    return res.json({
      success: true,
      message: "Signup successful",
      subscription: {
        email: newUser.email,
        key: newUser.key,
        k: newUser.k, // เพิ่ม token ที่สร้างไว้
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});


// เริ่มต้นเซิร์ฟเวอร์
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
