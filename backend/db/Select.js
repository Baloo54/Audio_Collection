import pool from './Config.js';

/**
 * Récupère toutes les soumissions avec leurs phrases associées.
 * @returns {Promise<Array>}
 */
export async function getAllSubmissions() {
  const query = `
    SELECT 
      u.id,
      u.age,
      u.gender,
      u.consent,
      u.num_phrases,
      u.zip_path,
      ARRAY_AGG(p.phrase ORDER BY p.id) AS phrases
    FROM users u
    LEFT JOIN phrases p ON u.id = p.user_id
    GROUP BY u.id
    ORDER BY u.id DESC
  `;

  const result = await pool.query(query);
  return result.rows;
}


/**
 * Récupère le chemin du fichier ZIP d'une session.
 * @param {number|string} sessionId
 * @returns {Promise<string|null>}
 */
export async function getZipPathById(sessionId) {
  const query = `SELECT zip_path FROM users WHERE id = $1`;
  const result = await pool.query(query, [sessionId]);

  if (result.rows.length === 0) return null;
  return result.rows[0].zip_path;
}

