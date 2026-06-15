const pool = require('../config/db');

exports.updateProfile = async (req, res) => {
  try {
    const { workspace_name } = req.body;
    const workspaceId = req.user.workspace_id;

    let backgroundImageUrl = null;
    if (req.file) {
      backgroundImageUrl = `/uploads/${req.file.filename}`;
    }

    if (backgroundImageUrl) {
      if (workspace_name) {
        await pool.query(
          'UPDATE Workspaces SET name = ?, background_image = ? WHERE id = ?',
          [workspace_name, backgroundImageUrl, workspaceId]
        );
      } else {
        await pool.query(
          'UPDATE Workspaces SET background_image = ? WHERE id = ?',
          [backgroundImageUrl, workspaceId]
        );
      }
      res.json({ message: 'Workspace berhasil diperbarui.', background_image: backgroundImageUrl });
    } else if (workspace_name) {
      await pool.query(
        'UPDATE Workspaces SET name = ? WHERE id = ?',
        [workspace_name, workspaceId]
      );
      res.json({ message: 'Workspace berhasil diperbarui.' });
    } else {
      res.json({ message: 'Tidak ada perubahan.' });
    }
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};
