import { supabase, checkAuth } from './supabase.js';

const userName = document.getElementById('userName');
const userBalance = document.getElementById('userBalance');
const gamesPlayed = document.getElementById('gamesPlayed');
const playBtn = document.getElementById('playBtn');
const logoutBtn = document.getElementById('logoutBtn');
const gamesHistory = document.getElementById('gamesHistory');

let currentUser = null;
let currentProfile = null;

async function init() {
  currentUser = await checkAuth();
  if (!currentUser) return;

  await loadUserProfile();
  await loadGamesHistory();
}

async function loadUserProfile() {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) throw error;

    currentProfile = profile;
    userName.textContent = `Bienvenue, ${profile.pseudo}! 👋`;
    userBalance.textContent = `${profile.solde.toLocaleString()} FCFA`;
    gamesPlayed.textContent = `${profile.games_played_today}/5`;

    if (profile.games_played_today >= 5) {
      playBtn.disabled = true;
      playBtn.textContent = 'Limite quotidienne atteinte';
      playBtn.style.opacity = '0.5';
      playBtn.style.cursor = 'not-allowed';
    }
  } catch (error) {
    console.error('Erreur de chargement du profil:', error);
  }
}

async function loadGamesHistory() {
  try {
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('date', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (games.length === 0) {
      gamesHistory.innerHTML = '<div class="loading">Aucune partie jouée</div>';
      return;
    }

    gamesHistory.innerHTML = games.map(game => {
      const date = new Date(game.date);
      const formattedDate = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="game-item">
          <div class="game-info">
            <div class="game-score">Score: ${game.score}/10</div>
            <div class="game-date">${formattedDate}</div>
          </div>
          <div class="game-gain">+${game.gain} FCFA</div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Erreur de chargement de l\'historique:', error);
    gamesHistory.innerHTML = '<div class="loading">Erreur de chargement</div>';
  }
}

playBtn.addEventListener('click', () => {
  if (currentProfile && currentProfile.games_played_today < 5) {
    window.location.href = '/quiz.html';
  }
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = '/index.html';
});

init();
