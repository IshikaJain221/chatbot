let faqs = {};

// Load FAQs from JSON file
fetch('faqs.json')
  .then(response => response.json())
  .then(data => {
    faqs = data;
    showQuestionTabs();
  });

// Utility function to clean punctuation and convert to lowercase
function cleanInput(text) {
  return text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();
}

function sendMessage() {
  const userInputRaw = document.getElementById('message').value.trim();
  if (!userInputRaw) return;

  addMessage(userInputRaw, 'user');

  const userInput = cleanInput(userInputRaw);
  let response = findBestMatch(userInput) || "🤖 Sorry, I don’t know that yet!";
  addMessage(response, 'bot');

  document.getElementById('message').value = '';
}

function findBestMatch(userInput) {
  // Exact match
  if (faqs[userInput]) return faqs[userInput];

  // Partial/cleaned match
  for (const question in faqs) {
    const cleanedQuestion = cleanInput(question);
    if (cleanedQuestion.includes(userInput) || userInput.includes(cleanedQuestion)) {
      return faqs[question];
    }
  }

  // Keyword-based match
  for (const question in faqs) {
    const cleanedQuestion = cleanInput(question);
    const questionWords = cleanedQuestion.split(" ");
    const inputWords = userInput.split(" ");

    let matchCount = 0;
    for (const word of questionWords) {
      if (inputWords.includes(word)) {
        matchCount++;
      }
    }

    if (matchCount >= Math.floor(questionWords.length / 2)) {
      return faqs[question];
    }
  }

  // Levenshtein typo-tolerance
  for (const question in faqs) {
    if (levenshtein(userInput, cleanInput(question)) <= 2) {
      return faqs[question];
    }
  }

  return null;
}

// Levenshtein distance
function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, () => []);
  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function addMessage(text, sender) {
  const chat = document.getElementById('chat');
  const bubble = document.createElement('div');
  bubble.className = 'bubble ' + sender;
  bubble.textContent = text;
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
}

document.getElementById('send').addEventListener('click', sendMessage);

// Allow Enter key to send message
document.getElementById('message').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') sendMessage();
});

function showQuestionTabs() {
  const questionsDiv = document.getElementById('questions');
  questionsDiv.innerHTML = '';

  Object.keys(faqs).forEach(question => {
    const tab = document.createElement('div');
    tab.className = 'question-tab';
    tab.textContent = question;
    tab.addEventListener('click', () => {
      document.getElementById('message').value = question;
      sendMessage();
    });
    questionsDiv.appendChild(tab);
  });
}
