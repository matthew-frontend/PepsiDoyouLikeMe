let messages = [
  "Please?",
  "Just try!",
  "Are you sure?",
  "Think again!",
  "You might regret this!",
  "One last chance!",
  "สักที เริ่มไม่ไหวละ 😶",
];
let noCount = 0;
let noButton = document.getElementById("noBtn");
let yesButton = document.getElementById("yesBtn");
let messageText = document.getElementById("message");

noButton.addEventListener("click", rejectLove);
yesButton.addEventListener("click", acceptLove);

function rejectLove() {
  if (noCount < messages.length) {
    messageText.innerText = messages[noCount];
    noCount++;
    noButton.style.transform = `scale(${1 - noCount * 0.1})`;
    yesButton.style.transform = `scale(${1 + noCount * 0.1})`;
  }
  if (noCount === messages.length) {
    noButton.style.display = "none";
  }
}

function acceptLove() {
  document.getElementById("questionContainer").innerHTML = `
        <div class="image-gif">
          <img src="./assets/images/cartoon.gif" class="gif">
        </div>
        <h2 id="textBefore" class="doYou">นั่นไงผมว่าแล้ววววว 😎</h2>
    `;

  const cheerSound = document.getElementById("cheerSound");
  // cheerSound.play(); // 👈 เล่นเสียงตรงนี

  launchConfetti();
  startHeartRain();
}

function launchConfetti() {
  var duration = 3 * 1000;
  var end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

function startHeartRain() {
  const heartContainer = document.getElementById("heart-container");
  setInterval(() => {
    let heart = document.createElement("div");
    heart.classList.add("heart");
    heart.innerHTML = "❤️";
    heart.style.left = Math.random() * window.innerWidth + "px";
    heartContainer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 5000);
  }, 300);
}
