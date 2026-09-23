const body = document.body;
const header = document.getElementById("siteHeader");
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const languageBtn = document.getElementById("languageBtn");
const languageMenu = document.getElementById("languageMenu");
const conditionInput = document.getElementById("conditionInput");
const locationInput = document.getElementById("locationInput");
const searchBtn = document.getElementById("searchBtn");
const searchMessage = document.getElementById("searchMessage");
const toast = document.getElementById("toast");
const assistantModal = document.getElementById("assistantModal");
const openAssistant = document.getElementById("openAssistant");
const closeAssistant = document.getElementById("closeAssistant");
const modalBackdrop = document.getElementById("modalBackdrop");
const assistantForm = document.getElementById("assistantForm");
const assistantInput = document.getElementById("assistantInput");
const assistantMessages = document.getElementById("assistantMessages");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 10);
});

menuBtn?.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});

mobileMenu?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

languageBtn?.addEventListener("click", () => {
  const open = languageMenu.classList.toggle("open");
  languageBtn.setAttribute("aria-expanded", open);
});

document.addEventListener("click", (event) => {
  if (!languageMenu.contains(event.target) && !languageBtn.contains(event.target)) {
    languageMenu.classList.remove("open");
    languageBtn.setAttribute("aria-expanded", "false");
  }
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function performSearch(term) {
  const cleanTerm = term.trim() || "General care";
  const location = locationInput?.value.trim() || "";
  searchMessage.textContent = `Preparing care results for “${cleanTerm}”${location ? ` near ${location}` : ""}…`;
  setTimeout(() => {
    const params = new URLSearchParams({q: cleanTerm});
    if (location) params.set('location', location);
    window.location.href = `hospitals.html?${params.toString()}`;
  }, 260);
}

searchBtn?.addEventListener("click", () => performSearch(conditionInput.value));

[conditionInput, locationInput].forEach(input => {
  input?.addEventListener("keydown", event => {
    if (event.key === "Enter") performSearch(conditionInput.value);
  });
});

document.querySelectorAll("[data-search]").forEach(button => {
  button.addEventListener("click", () => {
    const term = button.dataset.search;
    conditionInput.value = term;
    document.getElementById("find-care").scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => performSearch(term), 450);
  });
});

document.querySelectorAll(".language-pills button, .language-menu button").forEach(button => {
  button.addEventListener("click", () => {
    const lang = button.dataset.lang || button.textContent.trim();
    document.querySelectorAll(".language-pills button").forEach(b => b.classList.toggle("active", b.textContent.trim() === lang));
    if (languageBtn) {
      languageBtn.innerHTML = `<span aria-hidden="true">◎</span> ${lang} <span class="chevron">⌄</span>`;
    }
    languageMenu?.classList.remove("open");
    mobileMenu?.classList.remove("open");
    showToast(`Language selected: ${lang}`);
  });
});

document.getElementById("mobileLanguage")?.addEventListener("click", () => {
  languageMenu.classList.toggle("open");
});

document.getElementById("accessibilityBtn")?.addEventListener("click", () => {
  const action = confirm("Turn on larger text? Press Cancel to turn on high contrast instead.");
  if (action) {
    body.classList.toggle("large-text");
    showToast(body.classList.contains("large-text") ? "Larger text enabled." : "Larger text disabled.");
  } else {
    body.classList.toggle("high-contrast");
    showToast(body.classList.contains("high-contrast") ? "High contrast enabled." : "High contrast disabled.");
  }
});

function openAssistantModal() {
  assistantModal.classList.add("open");
  assistantModal.setAttribute("aria-hidden", "false");
  setTimeout(() => assistantInput.focus(), 100);
}
function closeAssistantModal() {
  assistantModal.classList.remove("open");
  assistantModal.setAttribute("aria-hidden", "true");
}

openAssistant?.addEventListener("click", openAssistantModal);
closeAssistant?.addEventListener("click", closeAssistantModal);
modalBackdrop?.addEventListener("click", closeAssistantModal);

document.getElementById("ctaSearch")?.addEventListener("click", () => {
  document.getElementById("find-care").scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => conditionInput.focus(), 650);
});

document.querySelectorAll(".chat-actions button").forEach(button => {
  button.addEventListener("click", () => {
    openAssistantModal();
    assistantInput.value = button.textContent.trim();
    assistantInput.focus();
  });
});

document.querySelectorAll("[data-chat]").forEach(button => {
  button.addEventListener("click", () => {
    assistantInput.value = button.dataset.chat;
    assistantForm.requestSubmit();
  });
});

function appendChat(text, type) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${type}-bubble`;
  bubble.textContent = text;
  assistantMessages.appendChild(bubble);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

function assistantReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes("heart") || lower.includes("chest")) {
    return "I can help you find hospitals with cardiac and emergency services. For severe or sudden chest pain, breathing difficulty, fainting, or pain spreading to the arm or jaw, seek emergency medical care immediately.";
  }
  if (lower.includes("cost") || lower.includes("price")) {
    return "You can compare estimated treatment ranges, facilities and hospital types on Curo. Actual hospital charges can vary, so the figures are shown as estimates.";
  }
  if (lower.includes("near") || lower.includes("hospital")) {
    return "Sure. Tell me the city or area, and what kind of care you are looking for. You can also start with one of the care categories on the home page.";
  }
  return "I can help you search for hospitals, understand care categories and compare available information. Tell me a condition, treatment or location to get started.";
}

assistantForm?.addEventListener("submit", event => {
  event.preventDefault();
  const message = assistantInput.value.trim();
  if (!message) return;
  appendChat(message, "user");
  assistantInput.value = "";
  setTimeout(() => appendChat(assistantReply(message), "assistant"), 450);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeAssistantModal();
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
