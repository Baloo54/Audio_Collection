/**
 * Étape d'introduction de l'application.
 * Recueille les informations de l'utilisateur : âge, genre, nombre de phrases, consentement.
 */
export default function IntroStep({
  age,
  gender,
  consent,
  phraseCount,
  setAge,
  setGender,
  setConsent,
  setPhraseCount,
  onStart,
}) {
  return (
    <div className="card">
      {/* Titre et instructions */}
      <h1>Bienvenue</h1>
      <h2>Merci pour votre participation !</h2>
      <p>
        Veuillez saisir votre âge, votre genre, le nombre de phrases à enregistrer,
        puis confirmer votre consentement.
      </p>

      {/* Champ âge */}
      <input
        type="number"
        placeholder="Âge"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        min={1}
        className="form-input"
      />

      {/* Sélection du genre */}
      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        className="form-input"
      >
        <option value="">Genre</option>
        <option value="Homme">Homme</option>
        <option value="Femme">Femme</option>
        <option value="Autre">Autre</option>
      </select>

      {/* Nombre de phrases à enregistrer */}
      <input
        type="number"
        placeholder="Nombre de phrases à enregistrer"
        value={phraseCount}
        onChange={(e) => setPhraseCount(Number(e.target.value))}
        min={1}
        max={100}
        className="form-input"
      />

      {/* Case de consentement */}
      <label className="form-checkbox">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        Je consens à participer à cette collecte anonyme.
      </label>

      {/* Bouton pour démarrer l'enregistrement */}
      <button
        disabled={!age || !gender || !consent || !phraseCount}
        onClick={onStart}
        className="purple-badger-btn"
      >
        Commencer
      </button>
    </div>
  );
}
