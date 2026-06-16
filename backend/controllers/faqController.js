const pool = require('../config/db');

/**
 * GET /api/faqs
 * Fetch all FAQs
 */
exports.getFaqs = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faqs ORDER BY created_at ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Gagal memuat FAQs.' });
  }
};

/**
 * POST /api/faqs
 * Create new FAQ (Admin only)
 */
exports.createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: 'Pertanyaan dan jawaban diperlukan.' });
    }

    await pool.query(
      'INSERT INTO faqs (question, answer) VALUES (?, ?)',
      [question, answer]
    );
    res.status(201).json({ message: 'FAQ berhasil dibuat.' });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ message: 'Gagal membuat FAQ.' });
  }
};

/**
 * PUT /api/faqs/:id
 * Update FAQ (Admin only)
 */
exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ message: 'Pertanyaan dan jawaban diperlukan.' });
    }

    const [result] = await pool.query(
      'UPDATE faqs SET question = ?, answer = ? WHERE id = ?',
      [question, answer, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'FAQ tidak ditemukan.' });
    }

    res.json({ message: 'FAQ berhasil diperbarui.' });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ message: 'Gagal memperbarui FAQ.' });
  }
};

/**
 * DELETE /api/faqs/:id
 * Delete FAQ (Admin only)
 */
exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM faqs WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'FAQ tidak ditemukan.' });
    }

    res.json({ message: 'FAQ berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ message: 'Gagal menghapus FAQ.' });
  }
};
