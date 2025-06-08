export default function IntroStep({
  age,
  gender,
  consent,
  phraseCount,
  setAge,
  setGender,
  setConsent,
  setPhraseCount,
  onStart
}) {
  return (
    <div className="card">
      {/* Titre de bienvenue */}
      <h1>Bienvenue</h1>

      {/* Instructions pour l'utilisateur */}
      <h2>Merci pour votre participation !</h2>

      <p>Veuillez saisir votre âge, genre, le nombre de phrases à enregistrer, puis confirmer votre consentement.</p>

      {/* Champ de saisie pour l'âge */}
      <input
        type="number"
        placeholder="Âge"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />

      {/* Liste déroulante pour le genre */}
      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      >
        <option value="">Genre</option>
        <option value="Homme">Homme</option>
        <option value="Femme">Femme</option>
        <option value="Autre">Autre</option>
      </select>

      {/* Champ pour le nombre de phrases */}
      <input
        type="number"
        placeholder="Nombre de phrases à enregistrer"
        value={phraseCount}
        onChange={(e) => setPhraseCount(Number(e.target.value))}
        min={1}
        max={100}
      />

      {/* Consentement */}
      <label>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        Je consens à participer à cette collecte anonyme.
      </label>

      {/* Bouton de démarrage */}
      <button
        disabled={!age || !gender || !consent || !phraseCount}
        onClick={onStart}
      >
        Commencer
      </button>
    </div>
  );
}
