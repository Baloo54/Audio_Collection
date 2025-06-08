export default function IntroStep({ age, gender, consent, setAge, setGender, setConsent, onStart }) {
  return (
    <div className="card">
      {/* Titre de bienvenue */}
      <h1>Bienvenue</h1>

      {/* Instructions pour l'utilisateur */}
      <p>Merci de participer. Veuillez saisir votre âge et genre, puis confirmer votre consentement.</p>

      {/* Champ de saisie pour l'âge */}
      <input
        type="number"                // Type numérique pour limiter la saisie à des nombres
        placeholder="Âge"            // Texte indicatif affiché quand le champ est vide
        value={age}                  // Valeur contrôlée, liée à l'état `age`
        onChange={(e) => setAge(e.target.value)} // Met à jour l'âge à chaque modification
      />

      {/* Liste déroulante pour sélectionner le genre */}
      <select
        value={gender}               // Valeur contrôlée, liée à l'état `gender`
        onChange={(e) => setGender(e.target.value)} // Met à jour le genre à chaque changement
      >
        <option value="">Genre</option>  {/* Option par défaut sans valeur */}
        <option value="Homme">Homme</option>
        <option value="Femme">Femme</option>
        <option value="Autre">Autre</option>
      </select>

      {/* Case à cocher pour consentement */}
      <label>
        <input
          type="checkbox"            // Case à cocher
          checked={consent}          // Valeur contrôlée liée à `consent`
          onChange={(e) => setConsent(e.target.checked)} // Met à jour le consentement à chaque changement
        />
        Je consens à participer à cette collecte anonyme.
      </label>

      <br /> {/* Saut de ligne pour espacer */}

      {/* Bouton pour démarrer la session */}
      <button
        disabled={!age || !gender || !consent} // Désactivé tant que âge, genre ou consentement manquent
        onClick={onStart}                      // Appelle la fonction `onStart` quand on clique
      >
        Commencer
      </button>
    </div>
  );
}
