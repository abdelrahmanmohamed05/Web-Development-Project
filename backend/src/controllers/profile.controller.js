const { query } = require("../config/db");

async function getProfile(req, res, next) {
  try {
    const result = await query(
      "SELECT id, name, email, profile_picture, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, email, profile_picture } = req.body;
    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           profile_picture = COALESCE($3, profile_picture),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
      `,
      [name, email, profile_picture, req.user.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: "Profile not found." });
    }
    const updated = await query("SELECT id, name, email, profile_picture FROM users WHERE id = $1", [req.user.id]);
    return res.status(200).json(updated.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
