// Composant fonctionnel type recevant deux props : titre et sousTitre
export default function Header({ titre, sousTitre }) {
  // 1. Logique JavaScript pure : formatage de la date locale
  const dateDuJour = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 2. Ce que la fonction retourne au moteur React :
  return (
    <header className="header">
      <h1>{titre}</h1>
      <p>{sousTitre}</p>
      <small
        style={{
          color: '#94a3b8',
          display: 'block',
          marginTop: '6px'
        }}
      >
        Date de la session : {dateDuJour}
      </small>
    </header>
  );
}
