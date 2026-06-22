const pool = require('../config/db');

exports.getTeamMembers = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, profile_picture, created_at FROM users WHERE workspace_id = ?',
      [workspaceId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const workspaceId = req.user.workspace_id;
    const userIdToRemove = req.params.id;
    const currentUserId = req.user.id;

    if (currentUserId == userIdToRemove) {
      return res.status(400).json({ message: 'You cannot delete yourself.' });
    }

    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ? AND workspace_id = ?',
      [userIdToRemove, workspaceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or not in your workspace.' });
    }

    res.json({ message: 'User removed successfully.' });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT u.name, u.email, u.profile_picture, w.name as workspace_name, w.background_image 
       FROM users u 
       JOIN workspaces w ON u.workspace_id = w.id 
       WHERE u.id = ?`,
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    // Safely replace any existing backslashes in legacy records with forward slashes
    const userProfile = rows[0];
    if (userProfile.profile_picture) {
      userProfile.profile_picture = userProfile.profile_picture.replace(/\\/g, '/');
    }
    if (userProfile.background_image) {
      userProfile.background_image = userProfile.background_image.replace(/\\/g, '/');
    }

    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    let profilePictureUrl = null;
    if (req.file) {
      // Normalize path separator for cloud compatibility
      const rawPath = `/uploads/${req.file.filename}`;
      profilePictureUrl = rawPath.replace(/\\/g, '/');
    }

    if (profilePictureUrl) {
      if (name) {
        await pool.query(
          'UPDATE users SET name = ?, profile_picture = ? WHERE id = ?',
          [name, profilePictureUrl, userId]
        );
      } else {
        await pool.query(
          'UPDATE users SET profile_picture = ? WHERE id = ?',
          [profilePictureUrl, userId]
        );
      }
      res.json({ message: 'Profil berhasil diperbarui.', profile_picture: profilePictureUrl });
    } else if (name) {
      await pool.query(
        'UPDATE users SET name = ? WHERE id = ?',
        [name, userId]
      );
      res.json({ message: 'Profil berhasil diperbarui.' });
    } else {
      res.json({ message: 'Tidak ada perubahan.' });
    }
  } catch (error) {
    console.error('Error updating profile:', error?.message || error);
    console.error('Stack:', error?.stack);
    res.status(500).json({ message: 'Terjadi kesalahan server saat memperbarui profil. Silakan coba lagi.' });
  }
};
