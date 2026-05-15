const { query } = require("../config/db");

async function getTaskComments(req, res, next) {
  try {
    const { taskId } = req.params;
    const result = await query(
      `SELECT c.*, u.name AS author_name
       FROM task_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.task_id = $1
       ORDER BY c.created_at DESC`,
      [taskId]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function createComment(req, res, next) {
  try {
    const { taskId } = req.params;
    const { comment, rating } = req.body;
    const insertResult = await query(
      `INSERT INTO task_comments (task_id, user_id, comment, rating)
       VALUES ($1, $2, $3, $4)`,
      [taskId, req.user.id, comment, rating || null]
    );
    const result = await query("SELECT * FROM task_comments WHERE id = $1", [insertResult.lastInsertRowid]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTaskComments,
  createComment,
};
