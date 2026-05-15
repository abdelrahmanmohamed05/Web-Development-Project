const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { getProfile, updateProfile } = require("../controllers/profile.controller");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getProfile);
router.put("/", updateProfile);

module.exports = router;
