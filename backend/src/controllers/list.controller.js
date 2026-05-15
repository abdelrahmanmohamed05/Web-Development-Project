const { query } = require("../config/db");

async function getLists(req, res, next) {
  try {
    const result = await query(
      "SELECT * FROM task_lists WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function createList(req, res, next) {
  try {
    const { name } = req.body;
    const insertResult = await query("INSERT INTO task_lists (user_id, name) VALUES ($1, $2)", [req.user.id, name]);
    const result = await query("SELECT * FROM task_lists WHERE id = $1", [insertResult.lastInsertRowid]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getLists,
  createList,
};
