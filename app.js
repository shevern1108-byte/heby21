const content = {
  us: [
    "1.png", "2 还记得吗hhhh.png", "3.png", "4.两次国内游.png", "5.jpg", "6.jpg",
    "7. 一起做的手工合集.png", "8. 超多对镜自拍.png", "9. 《好暧昧啊》.png", "10. 到底多爱拍jio.png",
    "11. 该你学习如何掌镜了.png", "12. 家庭合照s.png", "13.png", "14.png", "15 사랑해~.png"
  ],
  firsts: [
    "1.第一次来我中学.jpg", "2.第一次来我大学.jpg", "3.第一次一起搭地铁.JPG", "4.第一次一起毕业.JPG",
    "5.第一次参加你的毕业典礼.jpg", "6.你第一次参加我的毕业典礼.jpg", "7.第一次musicrun.jpg",
    "8.第一次一起看演唱会.jpg", "9.你第一次送我花.jpeg", "10.你第一次来我家.jpg",
    "11.第一次一起旅行.jpg", "12.第一次一起喝酒.jpg"
  ],
  myView: ["1.超古早.JPG", "2. 真的很多这个角度.jpg", "3. cute.jpg", "4.睡神.jpg", "5.依旧睡神.jpg", "6.认真哦.jpg", "7.尬笑快递员.jpg"],
  messages: ["1. 还记得这个古早味满满的留言吗.....PNG", "2.sibeh像半夜聊天的暧昧期情侣.PNG", "3.我猜你一定不记得了hhhhh.PNG", "4. 完全异地恋行为.jpg", "5. 还记得吧哈哈哈哈哈.jpg", "6.笑死我的一张.jpg"],
  recycle: ["1.妖娆呢.jpg", "2.异域风美女.jpg", "3.面膜怪.JPG", "4.好青涩哦.PNG", "5.什么脸.PNG", "6.哈哈哈哈哈哈啊哈哈哈.jpg", "7.我猜你一定不记得+1.mp4", "8. YOU NOW.jpg"]
};

const titles = { us: "US — MEMORY ARCHIVE", firsts: "FIRSTS", "my-view": "MY VIEW", messages: "messages.exe", recycle: "RECYCLE BIN" };
const taskIcons = { us:"assets/icons/us-folder.svg", firsts:"assets/icons/firsts-computer.svg", "my-view":"assets/icons/my-view-camera.svg", messages:"assets/icons/messages-envelope.svg", recycle:"assets/icons/recycle-bin.svg" };
const required = new Set(["us", "firsts", "my-view", "messages", "recycle"]);
const opened = new Set();
const windows = new Map();
let z = 10;
let soundsOn = true;
let recycleIntroSeen = false;
let recycleWarningStep = 0;
const BIRTHDAY_STORAGE_KEY = "heby21-midnight-update-v2";
const forceBirthdayPreview = new URLSearchParams(window.location.search).get("birthday") === "1" || window.location.hash === "#birthday";
let birthdayPromptDate = "";
let observedDate = "";
let audioContext;
let friendsHintShown = false;

const $ = (selector) => document.querySelector(selector);
const asset = (folder, name) => `assets/${folder}/${name}`;

function ensureAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playSound(name) {
  if (!soundsOn) return;
  const patterns = {
    click:[[620,.035,0]], open:[[440,.055,0],[660,.07,.055]], photo:[[740,.04,0],[880,.065,.045]],
    warning:[[250,.1,0],[190,.13,.1]], nope:[[180,.06,0],[120,.08,.07]], unlock:[[523,.08,0],[659,.08,.09],[784,.16,.18]],
    birthday:[[523,.1,0],[659,.1,.11],[784,.1,.22],[1047,.28,.33]], shutdown:[[420,.12,0],[315,.15,.13],[210,.28,.29]]
  };
  const ctx = ensureAudio();
  (patterns[name] || patterns.click).forEach(([frequency,duration,delay]) => {
    const oscillator=ctx.createOscillator(), gain=ctx.createGain(), start=ctx.currentTime+delay;
    oscillator.type="square"; oscillator.frequency.setValueAtTime(frequency,start);
    gain.gain.setValueAtTime(.0001,start); gain.gain.exponentialRampToValueAtTime(.035,start+.008); gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    oscillator.connect(gain).connect(ctx.destination); oscillator.start(start); oscillator.stop(start+duration+.02);
  });
}

function showFriendsHintOnce() {
  if (friendsHintShown) return;
  friendsHintShown = true;
  const hint=$("#friends-hint");
  hint.classList.remove("hidden");
  setTimeout(()=>hint.classList.add("hidden"),8000);
}

function boot() {
  const messages = ["Booting Version 21.0...", "Loading memories...", "Checking friendship archive...", "System ready ♡"];
  let step = 0;
  const timer = setInterval(() => {
    step += 1;
    $("#boot-progress").style.width = `${Math.min(step * 25, 100)}%`;
    $("#boot-copy").textContent = messages[Math.min(step, messages.length - 1)];
    if (step === 4) { clearInterval(timer); setTimeout(showDesktop, 450); }
  }, 620);
  $("#skip-boot").addEventListener("click", () => { clearInterval(timer); showDesktop(); });
}

function showDesktop() {
  $("#boot").classList.add("hidden");
  $("#desktop").classList.remove("hidden");
  updateClock();
  setInterval(updateClock, 30000);
  restoreBirthdayWallpaper();
  observedDate = shanghaiDateKey();
  checkBirthdayMoment();
}

function storageGet(key) {
  try { return localStorage.getItem(key); } catch (_) { return null; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch (_) { /* file previews may block storage */ }
}

function shanghaiDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone:"Asia/Shanghai", year:"numeric", month:"2-digit", day:"2-digit"
  }).formatToParts(new Date());
  const value = (type) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function restoreBirthdayWallpaper() {
  if (storageGet(BIRTHDAY_STORAGE_KEY) === shanghaiDateKey() && !forceBirthdayPreview) {
    $("#desktop").classList.add("birthday-mode");
  }
}

function showBirthdayPrompt(dateKey = shanghaiDateKey()) {
  if (birthdayPromptDate === dateKey) return;
  birthdayPromptDate = dateKey;
  $("#midnight-birthday-modal").classList.remove("hidden");
  if (audioContext) playSound("birthday");
}

function checkBirthdayMoment() {
  const today = shanghaiDateKey();
  if (forceBirthdayPreview) return showBirthdayPrompt("preview");
  if (!observedDate) return void (observedDate = today);
  if (today === observedDate) return;
  observedDate = today;
  $("#desktop").classList.remove("birthday-mode");
  showBirthdayPrompt(today);
}

function applyBirthdayUpdate() {
  $("#midnight-birthday-modal").classList.add("hidden");
  $("#desktop").classList.add("birthday-mode");
  if (!forceBirthdayPreview) storageSet(BIRTHDAY_STORAGE_KEY, shanghaiDateKey());
  playSound("birthday");
}

function beginUsGuide(message) {
  $("#welcome-modal").classList.add("hidden");
  $("#us-icon").classList.add("guide-us");
  showToast(message);
  showFriendsHintOnce();
}

$("#welcome-yes").addEventListener("click", () => { playSound("click"); beginUsGuide("那就先打开 US 吧 ♡"); });
$("#welcome-no").addEventListener("click", () => {
  playSound("click");
  $("#welcome-title").innerHTML = "我才不管你准备好没有<br>反正现在给我点 US 😡";
  $("#welcome-subtitle").textContent = "No escape. Open US now.";
  $("#welcome-actions").innerHTML = '<button id="welcome-fine" class="welcome-choice">好啦好啦</button>';
  $("#welcome-fine").addEventListener("click", () => beginUsGuide("现在，给我点 US 😡"));
});
document.querySelectorAll(".recycle-answer").forEach((button) => button.addEventListener("click", () => answerRecycleWarning(button.dataset.answer)));

function updateClock() {
  const now = new Date();
  $("#clock").textContent = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function gallery(folder, files, captions) {
  return `<div class="window-intro"><span>▣ ${files.length} memories, saved forever ♡</span><span>double click a photo</span></div><div class="gallery-grid">${files.map((file, i) => {
    const cleanedName = file.replace(/\.[^.]+$/, "").replace(/^\d+[. ]*/, "").trim();
    const caption = captions?.[i] || cleanedName || "one of us ♡";
    return `
    <figure class="polaroid" style="--tilt:${(i % 3 - 1) * 0.7}deg" data-photo="${asset(folder, file)}">
      <span class="number">${String(i + 1).padStart(2, "0")}</span>
      <img src="${asset(folder, file)}" alt="${file}" loading="lazy">
      <figcaption>${caption}</figcaption>
    </figure>`;
  }).join("")}</div>`;
}

function bodyFor(id) {
  if (id === "us") return gallery("us", content.us);
  if (id === "my-view") return gallery("my_view", content.myView);
  if (id === "firsts") return `<div class="window-intro"><span>✦ the beginning of everything ♡</span><span>12 firsts</span></div><ol class="memory-list">${content.firsts.map((file) => `<li data-photo="${asset("firsts", file)}"><span>${file.replace(/^\d+\./, "").replace(/\.[^.]+$/, "")}</span><b>»</b></li>`).join("")}</ol>`;
  if (id === "messages") return `<div class="message-stack">${content.messages.map((file, i) => {
    const caption = file.replace(/^\d+\.\s*/, "").replace(/\.[^.]+$/, "");
    return `<div class="speech message-caption ${i % 2 ? "me" : ""}">${caption}</div><img class="message-shot" data-photo="${asset("messages", file)}" src="${asset("messages", file)}" alt="${caption}" loading="lazy">`;
  }).join("")}</div>`;
  if (id === "recycle") return `<div class="window-intro"><span>Warning: embarrassing evidence found</span><span>nothing is really deleted</span></div><div class="trash-grid">${content.recycle.map((file) => { const isVideo = file.toLowerCase().endsWith(".mp4"); return `<button class="trash-item" ${isVideo ? "" : `data-photo="${asset("recycle_bin", file)}"`}>${isVideo ? `<video controls preload="metadata" src="${asset("recycle_bin", file)}"></video>` : `<img src="${asset("recycle_bin", file)}" alt="${file}" loading="lazy">`}<span>${file}</span></button>`; }).join("")}</div>`;
  return "";
}

function openWindow(id) {
  if (id === "last") return openLast();
  if (id === "recycle" && !recycleIntroSeen) return startRecycleWarning();
  playSound("open");
  if (id === "us") $("#us-icon").classList.remove("guide-us");
  markOpened(id);
  if (windows.has(id)) return focusWindow(windows.get(id));
  const win = document.createElement("section");
  const className = id === "us" ? "archive-window" : id === "firsts" ? "list-window" : id === "messages" ? "message-window" : id === "recycle" ? "recycle-window" : "viewer-window";
  win.className = `app-window ${className}`;
  win.dataset.id = id;
  win.style.zIndex = ++z;
  win.innerHTML = `<header class="window-titlebar"><strong>${titles[id]}</strong><button class="window-control minimize" aria-label="Minimize">–</button><button class="window-control close" aria-label="Close">×</button></header><div class="window-body">${bodyFor(id)}</div>`;
  $("#window-layer").append(win);
  windows.set(id, win);
  addTaskTab(id);
  bindWindow(win);
}

const recycleWarnings = [
  ["你确定你要看吗？", "Some things were deleted for a reason..."],
  ["你真的确定吗？", "This folder contains highly questionable evidence."],
  ["最后一次机会，你还要看吗？", "There is no going back after this."]
];

function startRecycleWarning() {
  recycleWarningStep = 0;
  renderRecycleWarning();
  $("#recycle-warning").classList.remove("hidden");
  playSound("warning");
}

function renderRecycleWarning() {
  const [title, subtitle] = recycleWarnings[recycleWarningStep];
  $("#warning-count").textContent = `WARNING ${recycleWarningStep + 1} / 3`;
  $("#warning-emoji").textContent = "?";
  $("#recycle-warning-title").textContent = title;
  $("#recycle-warning-subtitle").textContent = subtitle;
  if (recycleWarningStep > 0) playSound("warning");
}

function answerRecycleWarning(answer) {
  const dialog = document.querySelector(".recycle-warning-dialog");
  const advance = () => {
    recycleWarningStep += 1;
    if (recycleWarningStep < recycleWarnings.length) return renderRecycleWarning();
    recycleIntroSeen = true;
    $("#recycle-warning").classList.add("hidden");
    openWindow("recycle");
    setTimeout(() => showPhoto(asset("recycle_bin", content.recycle[0]), windows.get("recycle")), 180);
  };
  if (answer === "no") {
    playSound("nope");
    $("#warning-emoji").textContent = "🤪";
    $("#recycle-warning-title").textContent = "NO 也没有用";
    $("#recycle-warning-subtitle").textContent = "你逃不掉的 hhhhh";
    dialog.classList.add("nope");
    setTimeout(() => { dialog.classList.remove("nope"); advance(); }, 650);
  } else {
    advance();
  }
}

function bindWindow(win) {
  win.addEventListener("pointerdown", () => focusWindow(win));
  win.querySelector(".close").addEventListener("click", () => { playSound("click"); closeWindow(win.dataset.id); });
  win.querySelector(".minimize").addEventListener("click", () => { playSound("click"); win.classList.add("hidden"); });
  win.querySelectorAll("[data-photo]").forEach((node) => node.addEventListener("dblclick", () => showPhoto(node.dataset.photo, win)));
  win.querySelectorAll(".memory-list [data-photo],.trash-item[data-photo]").forEach((node) => node.addEventListener("click", () => showPhoto(node.dataset.photo, win)));
  makeDraggable(win, win.querySelector(".window-titlebar"));
}

function showPhoto(src, win) {
  playSound("photo");
  document.querySelector(".photo-modal")?.remove();
  const modal = document.createElement("div");
  modal.className = "photo-modal";
  modal.innerHTML = `<button class="photo-close" aria-label="Close photo">×</button><img src="${src}" alt="Expanded memory"><span class="photo-hint">click photo: original size / fit screen</span>`;
  modal.scrollTop = 0;
  modal.scrollLeft = 0;
  modal.querySelector(".photo-close").addEventListener("click", () => modal.remove());
  modal.querySelector("img").addEventListener("click", (event) => {
    event.stopPropagation();
    modal.classList.toggle("zoomed");
    modal.scrollTop = 0;
    modal.scrollLeft = 0;
  });
  modal.addEventListener("click", (event) => { if (event.target === modal) modal.remove(); });
  $("#desktop").append(modal);
}

function makeDraggable(win, handle) {
  let startX, startY, left, top;
  handle.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button") || innerWidth <= 760) return;
    event.preventDefault();
    const rect = win.getBoundingClientRect();
    const layer = $("#window-layer").getBoundingClientRect();
    startX = event.clientX; startY = event.clientY; left = rect.left - layer.left; top = rect.top - layer.top;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener("pointermove", (event) => {
    if (!handle.hasPointerCapture(event.pointerId)) return;
    const layer = $("#window-layer");
    const maxLeft = Math.max(0, layer.clientWidth - win.offsetWidth);
    const maxTop = Math.max(0, layer.clientHeight - 48);
    win.style.left = `${Math.max(0, Math.min(maxLeft, left + event.clientX - startX))}px`;
    win.style.top = `${Math.max(0, Math.min(maxTop, top + event.clientY - startY))}px`;
    win.style.right = "auto"; win.style.bottom = "auto";
  });
}

function addTaskTab(id) {
  const tab = document.createElement("button");
  tab.className = "task-tab"; tab.dataset.tab = id;
  tab.innerHTML = `<img src="${taskIcons[id]}" alt=""><span>${titles[id]}</span>`;
  tab.addEventListener("click", () => { playSound("click"); const win = windows.get(id); win.classList.remove("hidden"); focusWindow(win); });
  $("#task-tabs").append(tab);
}

function focusWindow(win) { win.classList.remove("hidden"); win.style.zIndex = ++z; }
function closeWindow(id) { windows.get(id)?.remove(); windows.delete(id); document.querySelector(`[data-tab="${id}"]`)?.remove(); }

function markOpened(id) {
  if (!required.has(id) || opened.has(id)) return;
  opened.add(id);
  $("#opened-count").textContent = opened.size;
  if (opened.size === required.size) unlockLast();
}

function unlockLast() {
  playSound("unlock");
  const icon = $("#last-icon");
  icon.classList.remove("locked"); icon.classList.add("unlocked");
  $("#last-icon-art").src = "assets/icons/open-last-unlocked.svg";
  $("#lock-label").textContent = "UNLOCKED ♡";
  showToast("OPEN_LAST.txt is now available ♡");
}

function openLast() {
  if (opened.size < required.size) {
    showToast(`This file is locked — ${opened.size} / ${required.size} memories opened`);
    return;
  }
  $("#desktop").classList.add("hidden");
  $("#letter").classList.remove("hidden");
}

let toastTimer;
function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

document.querySelectorAll("[data-open]").forEach((button) => button.addEventListener("click", () => openWindow(button.dataset.open)));
$("#friends-toggle").addEventListener("click", (event) => {
  ensureAudio();
  playSound("click");
  $("#friends-hint").classList.add("hidden");
  event.currentTarget.classList.toggle("is-smiling");
});
$("#start-button").addEventListener("click", () => { playSound("click"); showToast("Welcome to Heby's memory system ♡"); });
$("#sound-toggle").addEventListener("click", (event) => { soundsOn = !soundsOn; event.currentTarget.textContent = soundsOn ? "♬" : "♩̸"; if (soundsOn) playSound("click"); showToast(soundsOn ? "Sound on" : "Sound muted"); });
$("#close-letter").addEventListener("click", () => { playSound("unlock"); $("#letter").classList.add("hidden"); $("#complete").classList.remove("hidden"); });
$("#shutdown").addEventListener("click", () => { playSound("shutdown"); $("#complete").classList.add("hidden"); $("#shutdown-screen").classList.remove("hidden"); });
$("#apply-birthday-update").addEventListener("click", applyBirthdayUpdate);

setInterval(checkBirthdayMoment, 1000);
window.__showHebyBirthday = showBirthdayPrompt;

boot();
