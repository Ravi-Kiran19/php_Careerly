document.addEventListener("DOMContentLoaded", () => {
  let selectedCareer = window.careerName || "";
  let chatContainer = document.getElementById("chat-container");
  let messagesDiv = document.getElementById("chat-messages");
  let inputField = document.getElementById("user-input");
  let typingIndicator;

  window.toggleChat = function () {
    if (chatContainer.style.display === "flex") {
      chatContainer.style.display = "none";
      document.getElementById("chatbot-launcher").style.display = "block";
    } else {
      chatContainer.style.display = "flex";
      document.getElementById("chatbot-launcher").style.display = "none";
      inputField.focus();
    }
  };

  function addMessage(sender, text, color) {
    const messageEl = document.createElement("div");
    messageEl.classList.add("message");
    messageEl.style.backgroundColor = color;
    messageEl.innerHTML = `<strong>${sender}:</strong> ${text}`;
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function showTyping() {
    typingIndicator = document.createElement("div");
    typingIndicator.classList.add("message", "bot-message");
    typingIndicator.innerHTML = `<em>Bot is typing...</em>`;
    messagesDiv.appendChild(typingIndicator);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function hideTyping() {
    if (typingIndicator) {
      typingIndicator.remove();
      typingIndicator = null;
    }
  }

  function formatBotReply(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  async function sendMessage() {
    const msg = inputField.value.trim();
    if (!msg) return;

    addMessage("You", msg, "#f0f0f0");
    inputField.value = "";

    showTyping();

    try {
      const response = await fetch("/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, career: selectedCareer }),
      });
      const data = await response.json();
      hideTyping();
      addMessage("Bot", formatBotReply(data.reply), "#f4e6fa");
    } catch (error) {
      hideTyping();
      addMessage("Bot", "Sorry, something went wrong.", "#f4e6fa");
      console.error("Chatbot error:", error);
    }
  }

  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  document.getElementById("sendButton").addEventListener("click", sendMessage);

  // Floating hint popup
  setTimeout(() => {
    const hint = document.createElement("div");
    hint.id = "chat-float-hint";
    hint.style = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      background: #7846a7;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      font-family: 'Montserrat', sans-serif;
      box-shadow: 0 0 10px rgba(120, 70, 167, 0.6);
      cursor: default;
      z-index: 10000;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    hint.innerHTML = `
      <span>💡 Want to know more about the predicted career?</span>
      <span id="close-hint" style="cursor: pointer; font-weight: bold;">❌</span>
    `;
    document.body.appendChild(hint);

    document.getElementById("close-hint").onclick = () => {
      hint.style.opacity = "0";
      hint.style.transform = "translateY(20px)";
      setTimeout(() => hint.remove(), 300);
    };
  }, 3000);
});