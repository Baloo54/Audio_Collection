// --- db/insert.js ---
import pool from './Config.js';

/**
 * Insère un enregistrement utilisateur avec les phrases et le chemin du zip.
 * @param {Object} data
 * @param {string} data.age
 * @param {string} data.gender
 * @param {boolean} data.consent
 * @param {number} data.numPhrases
 * @param {string[]} data.phrases
 * @param {string} data.zipPath
 */
export async function insertSubmission({ age, gender, consent, numPhrases, phrases, zipPath }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insertion de l'utilisateur
    const insertUserQuery = `
      INSERT INTO users (age, gender, consent, num_phrases, zip_path)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const userResult = await client.query(insertUserQuery, [age, gender, consent, numPhrases, zipPath]);
    const userId = userResult.rows[0].id;

    // Insertion des phrases
    const insertPhraseQuery = `
      INSERT INTO phrases (user_id, phrase)
      VALUES ($1, $2)
    `;
    for (const phrase of phrases) {
      await client.query(insertPhraseQuery, [userId, phrase]);
    }

    await client.query('COMMIT');
    return userId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
