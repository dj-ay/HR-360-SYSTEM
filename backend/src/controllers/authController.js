const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const pool = require("../config/db")

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const connection = await pool.getConnection()

    // Check if user exists
    const [existingUser] = await connection.query("SELECT * FROM users WHERE email = ?", [email])

    if (existingUser.length > 0) {
      connection.release()
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    await connection.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [
      name,
      email,
      hashedPassword,
      role,
    ])

    connection.release()

    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" })
    }

    const connection = await pool.getConnection()

    const [users] = await connection.query("SELECT * FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      connection.release()
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const user = users[0]

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      connection.release()
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    connection.release()

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [users] = await connection.query(
      "SELECT user_id, name, email, role, department, designation FROM users WHERE user_id = ?",
      [req.user.user_id],
    )

    connection.release()

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(users[0])
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = { register, login, getCurrentUser }
