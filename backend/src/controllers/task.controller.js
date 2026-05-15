const { query } = require("../config/db");

async function getTasks(req, res, next) {
  try {
    const { status, priority, search } = req.query;
    const filters = ["t.user_id = $1"];
    const params = [req.user.id];

    if (status) {
      params.push(status);
      filters.push(`t.status = $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      filters.push(`t.priority = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      filters.push(`(LOWER(t.title) LIKE LOWER($${params.length}) OR LOWER(t.description) LIKE LOWER($${params.length}))`);
    }

    const sql = `
      SELECT t.*, l.name AS list_name
      FROM tasks t
      LEFT JOIN task_lists l ON l.id = t.list_id
      WHERE ${filters.join(" AND ")}
      ORDER BY t.created_at DESC
    `;

    const result = await query(sql, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, due_date, list_id } = req.body;
    const insertResult = await query(
      `INSERT INTO tasks (user_id, list_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.user.id, list_id || null, title, description || null, status || "todo", priority || "medium", due_date || null]
    );
    const result = await query("SELECT * FROM tasks WHERE id = $1", [insertResult.lastInsertRowid]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, list_id } = req.body;
    const result = await query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date),
           list_id = COALESCE($6, list_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
      `,
      [title, description, status, priority, due_date, list_id, id, req.user.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Task not found." });
    }
    const updated = await query("SELECT * FROM tasks WHERE id = $1 AND user_id = $2", [id, req.user.id]);
    return res.status(200).json(updated.rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [id, req.user.id]);
    if (!result.rowCount) {
      return res.status(404).json({ message: "Task not found." });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
