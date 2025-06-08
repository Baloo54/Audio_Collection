import { ALL_PHRASES } from './Phrases.jsx';

/**
 * Renvoie un tableau de phrases aléatoires sans doublons
 * @param {number} count - Nombre de phrases désirées
 * @returns {string[]} - Tableau de phrases aléatoires
 */
export default function GetRandomPhrases(count) {
  const shuffled = [...ALL_PHRASES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
