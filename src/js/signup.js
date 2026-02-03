import { supabase } from './supabase.js';

const signupForm = document.getElementById('signupForm');
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
    signupForm.querySelector('button[type="submit"]').disabled = true;
  } else {
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
    signupForm.querySelector('button[type="submit"]').disabled = false;
  }
}

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const pseudo = document.getElementById('pseudo').value.trim();
  const telephone = document.getElementById('telephone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!pseudo || !telephone || !password || !confirmPassword) {
    showError('Veuillez remplir tous les champs');
    return;
  }

  if (pseudo.length < 3) {
    showError('Le pseudo doit contenir au moins 3 caractères');
    return;
  }

  if (password.length < 6) {
    showError('Le mot de passe doit contenir au moins 6 caractères');
    return;
  }

  if (password !== confirmPassword) {
    showError('Les mots de passe ne correspondent pas');
    return;
  }

  setLoading(true);

  try {
    const { data: existingPseudo } = await supabase
      .from('profiles')
      .select('id')
      .eq('pseudo', pseudo)
      .maybeSingle();

    if (existingPseudo) {
      showError('Ce pseudo est déjà utilisé');
      setLoading(false);
      return;
    }

    const { data: existingPhone } = await supabase
      .from('profiles')
      .select('id')
      .eq('telephone', telephone)
      .maybeSingle();

    if (existingPhone) {
      showError('Ce numéro de téléphone est déjà utilisé');
      setLoading(false);
      return;
    }

    const email = `${telephone.replace(/\+/g, '')}@quizfcfa.app`;

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          pseudo: pseudo,
          telephone: telephone,
        },
      },
    });

    if (error) {
      showError('Erreur lors de l\'inscription: ' + error.message);
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
