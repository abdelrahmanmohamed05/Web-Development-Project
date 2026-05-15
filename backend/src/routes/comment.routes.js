const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { getTaskComments, createComment } = require("../controllers/comment.controller");

const router = express.Router();

router.use(authMiddleware);
router.get("/:taskId", getTaskComments);
router.post("/:taskId", createComment);

module.exports = router;
