import { supabase } from './supabase.js';

const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('error-message');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');

async function checkExistingSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    window.location.href = '/dashboard.html';
  }
}

checkExistingSession();

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
}

function hideError() {
  errorMessage.classList.remove('show');
}

function setLoading(loading) {
  if (loading) {
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    loginForm.querySelector('button[type="submit"]').disabled = true;
  } else {
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
    loginForm.querySelector('button[type="submit"]').disabled = false;
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const telephone = document.getElementById('telephone').value.trim();
  const password = document.getElementById('password').value;

  if (!telephone || !password) {
    showError('Veuillez remplir tous les champs');
    return;
  }

  setLoading(true);

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('telephone', telephone)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      showError('Numéro de téléphone non trouvé');
      setLoading(false);
      return;
    }

    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    let userEmail = null;
    if (!usersError && users) {
      const user = users.users.find(u => u.id === profile.id);
      if (user) {
        userEmail = user.email;
      }
    }

    if (!userEmail) {
      userEmail = `${telephone.replace(/\+/g, '')}@quizfcfa.app`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        showError('Mot de passe incorrect');
      } else {
        showError('Erreur de connexion: ' + error.message);
      }
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard.html';
  } catch (error) {
    console.error('Erreur:', error);
    showError('Une erreur est survenue. Veuillez réessayer.');
    setLoading(false);
  }
});
