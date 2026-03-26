const db = require("../models");
const bcrypt = require("bcryptjs");
const User = db.user;
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");

// Create and Save a new User

exports.create = async (req, res) => {
    try {
        const { username, email, password, role, createdBy } = req.body;

        // Validate request
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            createdBy
        });

        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
       res.status(500).json({ message: error.message || "Internal server error" }); 
    }
}

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate request
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
       res.status(500).json({ message: error.message || "Internal server error" }); 
    }
}

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" }); 
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { password, username, currentPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // If changing password, verify current password
    if (password) {
      if (!currentPassword) {
        return res.status(400).send({ message: "Current password is required" });
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).send({ message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(Number(10));
      user.password = await bcrypt.hash(password, salt);
      // record when the password was changed so existing tokens can be invalidated
      user.passwordChangedAt = new Date();
    }

    if (username) {
      user.username = username;
    }

    await user.save();

    res.status(200).send({ 
      message: "Profile updated successfully",
      passwordChanged: !!password,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};


// ============ ADMIN ONLY FUNCTIONS ============

exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, isActive, page = 1, pageSize = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    const whereClause = {};

    if (search) {
      const { Op } = require("sequelize");
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      offset,
      limit: parseInt(pageSize),
    });

    res.status(200).send({
      users: rows,
      totalItems: count,
      totalPages: Math.ceil(count / parseInt(pageSize)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required" });
    }

    // Validate role
    const validRoles = ["admin", "procurement", "normal", "approver"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).send({ message: "Invalid role" });
    }

    const userCheck = await User.findOne({ where: { email: email } });

    if (userCheck) {
      return res.status(409).send({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(Number(10));
    const hashedPassword = await bcrypt.hash(password, salt);


    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "operator",
      createdBy: req.user.id,
    });

    res.status(201).send({
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

exports.updateById = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, password, username, role, isActive } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Prevent admin from deactivating themselves
    if (userId === req.user.id && isActive === false) {
      return res.status(400).send({ message: "You cannot deactivate your own account" });
    }

    // Prevent changing own role
    if (userId === req.user.id && role && role !== user.role) {
      return res.status(400).send({ message: "You cannot change your own role" });
    }

    if (email && email !== user.email) {
      // Check if new email is already in use
      const existingUser = await User.findOne({ where: { email: email } });
      if (existingUser) {
        return res.status(409).send({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(Number(10));
      user.password = await bcrypt.hash(password, salt);
      // record admin-initiated password changes as well
      user.passwordChangedAt = new Date();
    }

    if (username !== undefined) {
      user.username = username;
    }

    if (role !== undefined) {
      const validRoles = ["admin", "operator", "customer_relation"];
      if (!validRoles.includes(role)) {
        return res.status(400).send({ message: "Invalid role" });
      }
      user.role = role;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    await user.save();

    res.status(200).send({ 
      message: "User updated successfully", 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};


exports.deleteById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).send({ message: "You cannot delete your own account" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    await user.destroy();

    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/**
 * Get user by ID (Admin only)
 */
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};