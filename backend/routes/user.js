const {create, createUser, loginUser, getProfile, updateProfile, getAllUsers, updateById, deleteById, getUserById} = require("../controller/user");
const router = require("express").Router();
const { verifyToken, adminOnly } = require("../middleware/auth");


// ============ PUBLIC ROUTES ============
// Self-registration (creates first admin automatically)
router.post("/register", create);

// Login
router.post("/login", loginUser);


// ============ AUTHENTICATED ROUTES ============
// Get own profile
router.get("/profile", verifyToken, getProfile);

// Update own profile (password, fullName)
router.put("/profile", verifyToken, updateProfile);

// ============ ADMIN ONLY ROUTES ============
// Get all users
router.get("/", verifyToken, adminOnly, getAllUsers);

// Create new user
router.post("/", verifyToken, adminOnly, createUser);

// Get user by ID
router.get("/:id", verifyToken, adminOnly, getUserById);

// Update user by ID
router.put("/:id", verifyToken, adminOnly, updateById);

// Delete user by ID
router.delete("/:id", verifyToken, adminOnly, deleteById);

module.exports = router;


