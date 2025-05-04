// Configuration GUN.js pour Heroku
const gun = Gun({
  peers: [
    'wss://NOM_DE_VOTRE_APP_HEROKU.herokuapp.com/gun' // ⚠️ Remplacez par votre URL Heroku !
  ],
  localStorage: false // Désactivé pour éviter les conflits
});

let blockchain = [];

// Synchronisation temps réel avec la blockchain
gun.get('blocks').map().on((block, id) => {
  if (!block || blockchain.find(b => b.hash === block.hash)) return;

  blockchain.push(block);
  updateUI();
  console.log('Nouveau bloc détecté ✅', block);
});

// Chargement initial de la blockchain
gun.get('blocks').once(blocks => {
  blockchain = Object.values(blocks || {});
  updateUI();
});

// Fonction de minage (exposée globalement)
window.startMining = async () => {
  const spaceMB = document.getElementById('spaceMB').value || 100;

  try {
    const response = await fetch('/mine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spaceMB })
    });

    if (!response.ok) throw new Error('Erreur HTTP');
    console.log('⛏️ Minage réussi !');

  } catch (error) {
    console.error('💥 Erreur:', error);
    alert('Échec du minage: ' + error.message);
  }
};

// Mise à jour de l'interface
function updateUI() {
  const balance = blockchain.reduce((total, block) => 
    total + (block.transactions?.[0]?.reward || 0), 0);

  document.getElementById('balance').textContent = balance.toFixed(2);
  
  document.getElementById('blocks').innerHTML = blockchain
    .map(b => `
      <div class="block">
        <strong>Bloc #${b.index}</strong>
        <span>${b.transactions[0].reward} MIO</span>
        <small>${new Date(b.timestamp).toLocaleTimeString()}</small>
      </div>
    `)
    .join('');
}

// Initialisation
updateUI();