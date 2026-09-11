/* =========================================================
   ⚙️ ตั้งค่าได้ตรงนี้ — แก้แค่บล็อกนี้ก็เปลี่ยนเนื้อหาได้เลย
   ========================================================= */
const CONFIG = {
  // ชื่อเล่นของเธอ (เว้นว่างไว้ได้ ถ้าไม่อยากใส่)
  crushName: "",

  // คำถามหลัก
  question: "คุณชอบผมไหม ?",

  // ข้อความกวน ๆ ตอนกด No (ไล่จากบนลงล่าง)
  noMessages: [
    "เอ๊ะ? กดผิดป่ะ 🥺",
    "ลองอีกทีนะ ขอร้อง 🙏",
    "แน่ใจแล้วจริง ๆ นะ? 😳",
    "คิดดูอีกทีสิ... 🤏",
    "ปุ่มนี้มันหนีเก่งมากเลยนะ 😼",
    "เดี๋ยวก่อน! ใจแข็งไปแล้ว 💔",
    "โอกาสสุดท้ายจริง ๆ นะ 🥹",
    "ก็ได้... แต่ผมยังไม่ยอมแพ้ 😤",
  ],
};

/* ========================================================= */

const withName = (text) =>
  CONFIG.crushName
    ? `${text.replace(/\s*\?\s*$/, "")} ${CONFIG.crushName} ?`
    : text;

const HEART_EMOJIS = ["❤️", "💖", "💕", "💗", "🩷", "💘", "🌸", "✨"];
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const questionContainer = document.getElementById("questionContainer");
const heartContainer = document.getElementById("heart-container");
const messageText = document.getElementById("message");
const noButton = document.getElementById("noBtn");
const yesButton = document.getElementById("yesBtn");
const cheerSound = document.getElementById("cheerSound");
const soundToggle = document.getElementById("soundToggle");

let noCount = 0;
let noScale = 1;
let noOffset = { x: 0, y: 0 };
let soundOn = false;
let accepted = false;

/* ---------- เริ่มต้น ---------- */
document.getElementById("textBefore").innerText = withName(CONFIG.question);
spawnFloaties();

noButton.addEventListener("click", rejectLove);
yesButton.addEventListener("click", acceptLove);

/* ปุ่ม No หนี — ใช้ได้ทั้งเมาส์และนิ้ว */
noButton.addEventListener("mouseenter", dodge);
noButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dodge();
  rejectLove();
});

/* ย่อ/ขยายหน้าจอแล้วปุ่มต้องไม่หลุดออกนอกการ์ด */
window.addEventListener("resize", () => {
  if (!accepted && (noOffset.x || noOffset.y)) dodge();
});

/* คลิกที่ไหนก็มีหัวใจเด้ง */
document.addEventListener("pointerdown", (e) =>
  popHearts(e.clientX, e.clientY),
);

/* ปุ่มเปิด/ปิดเสียง */
soundToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "🔊" : "🔇";
  soundToggle.setAttribute("aria-label", soundOn ? "ปิดเสียง" : "เปิดเสียง");
  if (soundOn && accepted) playCheer();
  if (!soundOn) cheerSound.pause();
});

/* ---------- ปุ่ม No ---------- */
function rejectLove() {
  if (accepted) return;

  const msg =
    CONFIG.noMessages[Math.min(noCount, CONFIG.noMessages.length - 1)];
  messageText.innerText = msg;
  messageText.classList.remove("pop");
  void messageText.offsetWidth; // reset animation
  messageText.classList.add("pop");

  noCount++;

  // Yes โตขึ้น / No หดลง (ใช้ transform ทั้งคู่ layout จะได้ไม่ขยับ)
  yesButton.style.setProperty(
    "--s",
    Math.min(1 + noCount * 0.12, 2.1).toFixed(2),
  );
  noScale = Math.max(1 - noCount * 0.09, 0.55);
  moveNoButton();

  // หมดข้อความแล้ว → ปุ่ม No หายไปเลย
  if (noCount >= CONFIG.noMessages.length) {
    noButton.style.opacity = "0";
    noButton.style.pointerEvents = "none";
    setTimeout(() => (noButton.style.display = "none"), 300);
    messageText.innerText = "เหลือปุ่มเดียวแล้วนะ 😏";
  }
}

/* ปุ่ม No วิ่งหนีไปมุมอื่นในการ์ด
   ตรึงตำแหน่งตั้งต้นครั้งเดียว (ปุ่ม Yes จะได้เด้งมาอยู่กลาง)
   จากนั้นขยับด้วย translate ล้วน ๆ → ลื่น ไม่ reflow และไม่ทำให้หน้าเว็บมี scroll */
function dodge() {
  if (accepted) return;

  const card = noButton.closest(".card");
  if (!card) return;

  if (noButton.style.position !== "absolute") {
    const { offsetLeft, offsetTop } = noButton;
    noButton.style.position = "absolute";
    noButton.style.left = `${offsetLeft}px`;
    noButton.style.top = `${offsetTop}px`;
  }

  const pad = 10;
  // offsetLeft/offsetWidth เป็นค่า layout จริง ไม่รวม transform ที่ใส่ไปแล้ว
  const maxLeft = Math.max(card.clientWidth - noButton.offsetWidth - pad, pad);
  const maxTop = Math.max(card.clientHeight - noButton.offsetHeight - pad, pad);

  noOffset = {
    x: rand(pad, maxLeft) - noButton.offsetLeft,
    y: rand(pad, maxTop) - noButton.offsetTop,
  };
  moveNoButton();
}

function moveNoButton() {
  noButton.style.transform = `translate(${Math.round(noOffset.x)}px, ${Math.round(
    noOffset.y,
  )}px) scale(${noScale.toFixed(2)})`;
}

/* ---------- ปุ่ม Yes ---------- */
function acceptLove() {
  if (accepted) return;
  accepted = true;

  questionContainer.innerHTML = `
    <div class="card letter">
      <div class="image-gif">
        <span class="sticker sticker--tl">💖</span>
        <span class="sticker sticker--tr">✨</span>
        <span class="sticker sticker--br">🎉</span>
        <img src="./assets/images/cartoon.gif" class="gif" alt="ดีใจสุด ๆ" />
      </div>
      <h2>${CONFIG.crushName ? `ขอบคุณนะ ${CONFIG.crushName} 🥹` : "นั่นไง ผมว่าแล้ววว 😎"}</h2>
    </div>
  `;

  launchConfetti();
  startHeartRain();
  if (soundOn) playCheer();
}

function playCheer() {
  cheerSound.currentTime = 0;
  cheerSound.play().catch(() => {
    /* เบราว์เซอร์บล็อกเสียงไว้ — ปล่อยผ่าน */
  });
}

/* ---------- เอฟเฟกต์ ---------- */
function launchConfetti() {
  if (typeof confetti !== "function") return;

  const end = Date.now() + 3000;
  const colors = ["#ff5f86", "#ffb3c6", "#ffd9e1", "#ffe0a3", "#c9e4ff"];

  confetti({ particleCount: 90, spread: 100, origin: { y: 0.6 }, colors });

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function startHeartRain() {
  setInterval(() => {
    if (document.hidden) return;

    const heart = document.createElement("div");
    const life = rand(4, 7);

    heart.className = "heart";
    heart.textContent = pick(HEART_EMOJIS);
    heart.style.left = `${rand(0, 100)}vw`;
    heart.style.fontSize = `${rand(16, 34)}px`;
    heart.style.animationDuration = `${life}s`;
    heartContainer.appendChild(heart);

    setTimeout(() => heart.remove(), life * 1000);
  }, 260);
}

/* หัวใจดวงเล็กกระจายตอนคลิก */
function popHearts(x, y) {
  for (let i = 0; i < 5; i++) {
    const h = document.createElement("span");
    const angle = rand(0, Math.PI * 2);
    const dist = rand(30, 80);

    h.className = "pop-heart";
    h.textContent = pick(HEART_EMOJIS);
    h.style.left = `${x}px`;
    h.style.top = `${y}px`;
    h.style.fontSize = `${rand(12, 22)}px`;
    h.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    h.style.setProperty("--dy", `${Math.sin(angle) * dist - 20}px`);
    document.body.appendChild(h);

    setTimeout(() => h.remove(), 900);
  }
}

/* หัวใจ/ดอกไม้ลอยขึ้นเป็นฉากหลัง */
function spawnFloaties() {
  const layer = document.querySelector(".bg-decor");
  if (!layer) return;

  for (let i = 0; i < 14; i++) {
    const f = document.createElement("span");
    f.className = "floaty";
    f.textContent = pick(HEART_EMOJIS);
    f.style.left = `${rand(0, 98)}%`;
    f.style.fontSize = `${rand(14, 30)}px`;
    f.style.animationDuration = `${rand(11, 22)}s`;
    f.style.animationDelay = `${-rand(0, 20)}s`;
    layer.appendChild(f);
  }
}
