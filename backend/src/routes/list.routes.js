const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { getLists, createList } = require("../controllers/list.controller");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getLists);
router.post("/", createList);

module.exports = router;
