export default function IntroStep({ age, gender, consent, setAge, setGender, setConsent, onStart }) {
  return (
    <div className="card">
      <h1>Bienvenue</h1>
      <p>Merci de participer. Veuillez saisir votre âge et genre, puis confirmer votre consentement.</p>
      <input
        type="number"
        placeholder="Âge"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="">Genre</option>
        <option value="Homme">Homme</option>
        <option value="Femme">Femme</option>
        <option value="Autre">Autre</option>
      </select>
      <label>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        Je consens à participer à cette collecte anonyme.
      </label>
      <br />
      <button disabled={!age || !gender || !consent} onClick={onStart}>Commencer</button>
    </div>
  );
}
