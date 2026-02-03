import { supabase, checkAuth } from './supabase.js';

const currentQuestionEl = document.getElementById('currentQuestion');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const questionTextEl = document.getElementById('questionText');
const answersContainer = document.getElementById('answersContainer');
const feedbackEl = document.getElementById('feedback');
const resultsCard = document.getElementById('resultsCard');
const finalScoreEl = document.getElementById('finalScore');
const finalGainEl = document.getElementById('finalGain');

let currentUser = null;
let currentProfile = null;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 20;
let timerInterval = null;
let isAnswering = false;

const GAIN_PER_CORRECT_ANSWER = 10;

async function init() {
  currentUser = await checkAuth();
  if (!currentUser) return;

  await loadUserProfile();
  await loadQuestions();
  startQuiz();
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

    if (profile.games_played_today >= 5) {
      alert('Vous avez atteint la limite quotidienne de 5 parties');
      window.location.href = '/dashboard.html';
      return;
    }
  } catch (error) {
    console.error('Erreur de chargement du profil:', error);
    alert('Erreur de chargement');
    window.location.href = '/dashboard.html';
  }
}

async function loadQuestions() {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*');

    if (error) throw error;

    if (data.length < 10) {
      alert('Pas assez de questions disponibles');
      window.location.href = '/dashboard.html';
      return;
    }

    const shuffled = data.sort(() => Math.random() - 0.5);
    questions = shuffled.slice(0, 10);
  } catch (error) {
    console.error('Erreur de chargement des questions:', error);
    alert('Erreur de chargement des questions');
    window.location.href = '/dashboard.html';
  }
}

function startQuiz() {
  displayQuestion();
}

function displayQuestion() {
  if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
  }

  const question = questions[currentQuestionIndex];
  currentQuestionEl.textContent = currentQuestionIndex + 1;
  questionTextEl.textContent = question.question;
  feedbackEl.classList.remove('show', 'correct', 'incorrect');
  isAnswering = false;

  answersContainer.innerHTML = '';
  const answers = [
    { text: question.choix1, index: 1 },
    { text: question.choix2, index: 2 },
    { text: question.choix3, index: 3 },
    { text: question.choix4, index: 4 }
  ];

  answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = answer.text;
    btn.onclick = () => selectAnswer(answer.index, question.bonne_reponse);
    answersContainer.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  timeLeft = 20;
  timerEl.textContent = timeLeft;
  timerEl.classList.remove('warning', 'danger');

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 5) {
      timerEl.classList.add('danger');
    } else if (timeLeft <= 10) {
      timerEl.classList.add('warning');
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (!isAnswering) {
        timeOut();
      }
    }
  }, 1000);
}

function selectAnswer(selectedIndex, correctIndex) {
  if (isAnswering) return;

  isAnswering = true;
  clearInterval(timerInterval);

  const buttons = answersContainer.querySelectorAll('.answer-btn');
  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if (index + 1 === correctIndex) {
      btn.classList.add('correct');
    } else if (index + 1 === selectedIndex) {
      btn.classList.add('incorrect');
    }
  });

  if (selectedIndex === correctIndex) {
    score++;
    scoreEl.textContent = score;
    feedbackEl.textContent = '✅ Bonne réponse! +' + GAIN_PER_CORRECT_ANSWER + ' FCFA';
    feedbackEl.classList.add('show', 'correct');
  } else {
    feedbackEl.textContent = '❌ Mauvaise réponse';
    feedbackEl.classList.add('show', 'incorrect');
  }

  setTimeout(() => {
    currentQuestionIndex++;
    displayQuestion();
  }, 1500);
}

function timeOut() {
  isAnswering = true;
  const correctIndex = questions[currentQuestionIndex].bonne_reponse;

  const buttons = answersContainer.querySelectorAll('.answer-btn');
  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if (index + 1 === correctIndex) {
      btn.classList.add('correct');
    }
  });

  feedbackEl.textContent = '⏰ Temps écoulé!';
  feedbackEl.classList.add('show', 'incorrect');

  setTimeout(() => {
    currentQuestionIndex++;
    displayQuestion();
  }, 1500);
}

async function endQuiz() {
  clearInterval(timerInterval);

  document.querySelector('.quiz-header').style.display = 'none';
  document.querySelector('.quiz-card').style.display = 'none';

  const totalGain = score * GAIN_PER_CORRECT_ANSWER;

  finalScoreEl.textContent = `${score}/10`;
  finalGainEl.textContent = `${totalGain} FCFA`;
  resultsCard.style.display = 'block';

  try {
    const newBalance = currentProfile.solde + totalGain;
    const newGamesPlayed = currentProfile.games_played_today + 1;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        solde: newBalance,
        games_played_today: newGamesPlayed,
        last_game_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', currentUser.id);

    if (updateError) throw updateError;

    const { error: gameError } = await supabase
      .from('games')
      .insert({
        user_id: currentUser.id,
        score: score,
        gain: totalGain,
        date: new Date().toISOString()
      });

    if (gameError) throw gameError;
  } catch (error) {
    console.error('Erreur de sauvegarde:', error);
  }
}

init();
