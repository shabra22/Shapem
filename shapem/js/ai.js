/* ═══════════════════════════════════════════
   SHAPEM — AI Chef Chat
═══════════════════════════════════════════ */

function appendMessage(text, role) {
  role = role || 'bot';
  var messages = document.getElementById('aiMessages');
  if (!messages) return;
  var msg = document.createElement('div');
  msg.className = 'ai-msg ' + role;
  var bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;
  msg.appendChild(bubble);
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
  return msg;
}

function showTyping() {
  var messages = document.getElementById('aiMessages');
  if (!messages) return null;
  var typing = document.createElement('div');
  typing.className = 'ai-msg bot';
  typing.id = 'typingIndicator';
  typing.innerHTML = '<div class="msg-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;
  return typing;
}

function removeTyping() {
  var el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function getAIResponse(prompt) {
  var p = prompt.toLowerCase();
  var suggestions = AI_RESPONSES.default_suggestions;
  var intro = "Here are some ideas I think you'll love:";

  if (p.includes('chicken') || p.includes('lemon') || p.includes('rice')) {
    suggestions = AI_RESPONSES.chicken;
    intro = 'With chicken, lemon, and rice you can make some beautiful dishes:';
  } else if (p.includes('keto') || p.includes('low carb')) {
    suggestions = AI_RESPONSES.keto;
    intro = 'Here are some delicious keto recipes under 500 calories:';
  } else if (p.includes('vegan') || p.includes('plant')) {
    suggestions = AI_RESPONSES.vegan;
    intro = 'Great plant-based choices coming right up:';
  } else if (p.includes('budget') || p.includes('cheap') || p.includes('family')) {
    suggestions = AI_RESPONSES.budget;
    intro = 'Delicious and budget-friendly recipes for you:';
  } else if (p.includes('kenya') || p.includes('ugali') || p.includes('sukuma')) {
    suggestions = AI_RESPONSES.kenya;
    intro = 'Here are some authentic Kenyan recipes to explore:';
  } else if (p.includes('breakfast')) {
    intro = 'Some wonderful breakfast options:';
    suggestions = [
      'Avocado & Poached Egg Toast \uD83E\uDD51 — ready in 10 minutes.',
      'Shakshuka \uD83C\uDF73 — spiced eggs, satisfying and warming.',
      'Overnight Oats with Mango \uD83E\uDD6D — prep the night before.'
    ];
  } else if (p.includes('dessert') || p.includes('sweet') || p.includes('cake')) {
    intro = 'Indulge yourself with these desserts:';
    suggestions = [
      'Tiramisu \u2615 — classic Italian, no baking needed.',
      'Mango Sticky Rice \uD83E\uDD6D — Thai street food classic.',
      'Dark Chocolate Lava Cake 🍫 — 20 minutes, showstopper.'
    ];
  }
  return { intro: intro, suggestions: suggestions };
}

function appendRecipeSuggestions(suggestions) {
  var messages = document.getElementById('aiMessages');
  if (!messages) return;
  suggestions.forEach(function(s) {
    var parts = s.split(' — ');
    var el = document.createElement('div');
    el.className = 'ai-msg bot';
    var bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    var card = document.createElement('div');
    card.className = 'ai-recipe-result';
    var title = document.createElement('div');
    title.className = 'ai-recipe-result-title';
    title.textContent = parts[0];
    card.appendChild(title);
    if (parts[1]) {
      var desc = document.createElement('div');
      desc.className = 'ai-recipe-result-desc';
      desc.textContent = parts[1];
      card.appendChild(desc);
    }
    bubble.appendChild(card);
    el.appendChild(bubble);
    messages.appendChild(el);
  });
  messages.scrollTop = messages.scrollHeight;
}

function sendAIMessage(prompt) {
  prompt = (prompt || '').trim();
  if (!prompt) return;

  // Clear input first
  var input = document.getElementById('aiInput');
  if (input) input.value = '';

  // Show user message
  appendMessage(prompt, 'user');

  // Show typing
  showTyping();

  // Respond after delay
  var delay = 800 + Math.random() * 500;
  setTimeout(function() {
    removeTyping();
    var response = getAIResponse(prompt);
    appendMessage(response.intro, 'bot');
    setTimeout(function() {
      appendRecipeSuggestions(response.suggestions);
    }, 300);
  }, delay);
}

function initAI() {
  var input   = document.getElementById('aiInput');
  var sendBtn = document.getElementById('aiSend');

  if (!input || !sendBtn) {
    console.warn('AI Chat: input or send button not found');
    return;
  }

  // Send on button click
  sendBtn.addEventListener('click', function() {
    sendAIMessage(input.value);
  });

  // Send on Enter key
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendAIMessage(input.value);
    }
  });

  // Suggestion chips — attach after a tick to make sure they exist
  setTimeout(function() {
    document.querySelectorAll('.ai-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var prompt = chip.dataset.prompt;
        if (!prompt) return;
        if (input) input.value = prompt;
        // Make sure AI section is visible
        var section = document.getElementById('ai-finder');
        if (section) {
          section.style.opacity = '1';
          section.style.transform = 'translateY(0)';
          section.scrollIntoView({ behavior: 'smooth' });
        }
        setTimeout(function() { sendAIMessage(prompt); }, 400);
      });
    });
  }, 100);
}
