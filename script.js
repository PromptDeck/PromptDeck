// ===== 載入 Firebase SDK =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
  getFirestore, collection, addDoc, query,
  orderBy, getDocs, deleteDoc, doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

// ====== Data（每日語錄、範本、成就、彩蛋等）======
const dailyQuotes = [
  "AI 小助手：今天要來點新靈感嗎？🌟",
  "你的每一個想法都很珍貴，別忘了收藏下來！✨",
  "AI 幫你省下時間，讓你聚焦於創意本身！🚀",
  "嘗試不同語氣，你會有新發現😎",
  "靈感其實都在你的日常 💫"
];
const onboardingQuestions = [
  {
    q: "你最常用 prompt 來做什麼？",
    type: "multi",
    options: ["社群內容", "行銷企劃", "教學學習", "創作靈感", "圖像生成", "其他"]
  },
  {
    q: "你希望 AI 助理用什麼語氣跟你互動？",
    type: "single",
    options: ["專業", "輕鬆", "幽默", "啟發", "品牌感"]
  },
  {
    q: "你常用的 AI 平台是？",
    type: "single",
    options: ["ChatGPT", "Midjourney", "Gemini", "其他"]
  }
];
const goalEmojis = {
  '激發創意': '💡',
  '效率工作': '⚡',
  '品牌塑造': '🌈',
  '學習成長': '📚',
  '趣味互動': '🎉'
};
const userRoleTones = {
  '社群小編': ["用熱情一點的語氣", "加入趣味互動", "讓內容更親切😊"],
  '老師': ["用引導、鼓勵的語氣", "多用範例", "幫助學生理解👍"],
  '設計師': ["語氣活潑有創意", "強調視覺效果", "設計感十足😎"],
  '產品經理': ["邏輯清晰", "目標明確", "條列重點📋"],
  'default': ["語氣清楚明確", "適時加入情緒詞", "讓內容更易懂😉"]
};
const randomFeedback = [
  "這個 prompt 很有潛力！要不要再試一種語氣？",
  "你已經走在 AI 時代尖端 🚀",
  "加油，你的內容會讓人眼睛一亮！",
  "每次產生的靈感都會讓世界更有趣 🌍",
  "如果覺得好用，記得加到我的最愛收藏唷！"
];
const achievements = [
  { badge: "新手入門", condition: { createCount: 1 }, message: "恭喜產生第一個 Prompt！" },
  { badge: "10收藏達成", condition: { favoriteCount: 10 }, message: "你已經收藏10則，AI 給你特別推薦！" },
  { badge: "連續三天", condition: { streak: 3 }, message: "三天都在精進自己，持續下去會有新彩蛋喔！" }
];
const easterEggs = [
  { keyword: "神秘", message: "🔮 你觸發了神秘彩蛋，試著多發掘隱藏玩法！" }
];

// ======= Firebase config（你的金鑰）=======
const firebaseConfig = {
  apiKey: "AIzaSyDPE6TL1HbFbIHnRZnL1uHX0sv3AYNr9dQ",
  authDomain: "promptdeck-8366f.firebaseapp.com",
  projectId: "promptdeck-8366f",
  storageBucket: "promptdeck-8366f.firebasestorage.app",
  messagingSenderId: "1047872909519",
  appId: "1:1047872909519:web:5fe6b0e35d109d63de07ba",
  measurementId: "G-QD99FJNSGH"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// ======= DOM 物件 ======
const loginModal = document.getElementById('login-modal');
const userDisplay = document.getElementById('user-display');
const promptForm = document.getElementById('prompt-form');
const outputSection = document.getElementById('output-section');
const favoritesSection = document.getElementById('favorites-section');
const toastDiv = document.getElementById('toast');
const welcomeArea = document.getElementById('welcome-area');
const dynamicFeedback = document.getElementById('dynamic-feedback');
const onboardingModal = document.getElementById('onboarding-modal');
const onboardingStepDiv = document.getElementById('onboarding-step');
const onboardingControls = document.getElementById('onboarding-controls');
const assistantBubble = document.getElementById('assistant-bubble');

// ====== LocalProfile／同步 Firestore =======
function getLocalProfile() {
  return JSON.parse(localStorage.getItem("profile") || "{}");
}
function setLocalProfile(profile) {
  localStorage.setItem("profile", JSON.stringify(profile));
}
async function saveProfile(uid, profile) {
  setLocalProfile(profile);
  if (uid) await setDoc(doc(db, "users", uid, "profile", "meta"), profile);
}
async function fetchProfile(uid) {
  if (!uid) return getLocalProfile();
  let snap = await getDoc(doc(db, "users", uid, "profile", "meta"));
  let data = snap.exists() ? snap.data() : getLocalProfile();
  setLocalProfile(data);
  return data;
}

// ==== Onboarding ====
let onboardingAnswers = {};
function showOnboardingFlow() {
  let step = 0;
  onboardingModal.classList.remove('hidden');
  renderStep();
  function renderStep() {
    onboardingStepDiv.innerHTML = `
      <div style="font-size:1.1em;margin-bottom:1.3em;">${onboardingQuestions[step].q}</div>
      <div id="options"></div>
    `;
    onboardingControls.innerHTML = '';
    const optsDiv = document.getElementById('options');
    if (onboardingQuestions[step].type === "multi") {
      onboardingQuestions[step].options.forEach(opt => {
        const c = document.createElement("label");
        c.innerHTML = `<input type="checkbox" value="${opt}"> ${opt}`;
        c.style.display = "block";
        optsDiv.appendChild(c);
      });
    } else {
      onboardingQuestions[step].options.forEach(opt => {
        const b = document.createElement("button");
        b.textContent = opt; b.type = "button"; b.className = "btn-secondary";
        b.onclick = () => { onboardingAnswers[step] = opt; nextStep(); };
        optsDiv.appendChild(b);
      });
    }
    if (onboardingQuestions[step].type === "multi") {
      const btn = document.createElement("button");
      btn.textContent = "下一步"; btn.type = "button"; btn.className = "btn-submit";
      btn.onclick = () => {
        const values = Array.from(optsDiv.querySelectorAll('input[type=checkbox]:checked')).map(i=>i.value);
        if (values.length === 0) return showToast("請至少選一項");
        onboardingAnswers[step] = values;
        nextStep();
      };
      onboardingControls.appendChild(btn);
    }
    function nextStep() {
      if (++step >= onboardingQuestions.length) finishOnboarding();
      else renderStep();
    }
  }
  function finishOnboarding() {
    onboardingModal.classList.add('hidden');
    let profile = getLocalProfile();
    profile.onboarding = {
      mainUsage: onboardingAnswers[0],
      preferTone: onboardingAnswers[1],
      mainPlatform: onboardingAnswers[2]
    };
    profile.createCount = profile.createCount || 0;
    profile.favoriteCount = profile.favoriteCount || 0;
    profile.badges = profile.badges || [];
    profile.streak = profile.streak || 0;
    saveProfile(auth.currentUser?.uid, profile);
    renderAssistantBubble(`Hi 👋 我是你的 AI 助理，已根據你的偏好幫你推薦合適的體驗！`);
    setTimeout(()=>assistantBubble.classList.remove("pop"), 3000);
    renderWelcome();
  }
}

// ==== 助理歡迎語與推薦 ====
function renderAssistantBubble(msg) {
  assistantBubble.textContent = msg;
  assistantBubble.classList.add("pop");
  setTimeout(()=>assistantBubble.classList.remove("pop"), 3200);
}
function getWelcomeMessage(profile) {
  if (!profile || !profile.onboarding) return "歡迎來到 PromptDeck，開始屬於你的 AI 創意之旅！";
  let usage = profile.onboarding.mainUsage?.[0] || "創意激發";
  let tone = profile.onboarding.preferTone || "專業";
  return `Hi！很高興再次見到你。今天要不要做個${usage}類的 prompt？AI 推薦用「${tone}」語氣試試！`;
}
function getDailyQuote() {
  const d = new Date().getDate();
  return dailyQuotes[d % dailyQuotes.length];
}
function renderWelcome() {
  let profile = getLocalProfile();
  welcomeArea.innerHTML = `
    <div class="ai-welcome">${getWelcomeMessage(profile)}</div>
    <div class="ai-quote">${getDailyQuote()}</div>
  `;
}

// ==== 登入與用戶顯示 ====
onAuthStateChanged(auth, async user => {
  if (user) {
    userDisplay.innerHTML =
      `<span class="user-mail">${user.email || user.displayName}</span>
       <button id="logoutBtn" class="logout-btn">登出</button>`;
    document.getElementById('logoutBtn').onclick = () => signOut(auth);
    favoritesSection.style.display = 'block';
    // 同步 profile
    let profile = await fetchProfile(user.uid);
    setLocalProfile(profile);
    if (!profile.onboarding) showOnboardingFlow();
    else renderWelcome();
    await renderFavorites();
  } else {
    userDisplay.innerHTML = `<span class="login-link" id="showLogin">登入 / 註冊</span>`;
    document.getElementById('showLogin').onclick = () => loginModal.classList.remove('hidden');
    favoritesSection.style.display = 'none';
    welcomeArea.innerHTML = `
      <div class="ai-welcome">👋 歡迎光臨 PromptDeck！<br>立即登入就能擁有專屬小助理與雲端收藏體驗。</div>
      <div class="ai-quote">${getDailyQuote()}</div>
    `;
  }
});
document.getElementById('modal-close').onclick = () => loginModal.classList.add('hidden');
window.onclick = e => { if (e.target === loginModal) loginModal.classList.add('hidden'); };
document.getElementById('google-login').onclick = async () => {
  try { await signInWithPopup(auth, provider); loginModal.classList.add('hidden'); }
  catch (e) { showToast('Google 登入失敗'); }
};

// ==== prompt 產生（模擬AI互動+語氣推薦+彩蛋）====
promptForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  // 必填檢查
  const topic = promptForm.topic.value.trim();
  const userRole = promptForm.userRole.value.trim();
  const audience = promptForm.audience.value.trim();
  const platform = promptForm.platform.value.trim();
  const tone = promptForm.tone.value.trim();
  const constraint = promptForm.constraint.value.trim();
  const reference = promptForm.reference.value.trim();
  const format = promptForm.format.value.trim();
  const goal = promptForm.goal.value.trim();
  if (!topic || !userRole || !audience || !platform || !tone || !format || !goal) {
    showToast("請完整填寫所有必填欄位");
    return;
  }

  // 彩蛋檢查
  let triggered = false;
  easterEggs.forEach(egg => {
    if (topic.includes(egg.keyword)) {
      renderAssistantBubble(egg.message);
      triggered = true;
    }
  });

  // 語氣推薦
  let rec = userRoleTones[userRole] || userRoleTones['default'];
  const feedbackMsg = triggered
    ? "🎊 恭喜你觸發彩蛋，AI 小助理已送上神秘能量！"
    : `建議用 ${tone} 語氣，${rec[Math.floor(Math.random()*rec.length)]}。`;

  // 組合 prompt
  let result =
    `目標：${goal}${goalEmojis[goal]||''}\n` +
    `主題內容：${topic}\n` +
    `角色：${userRole}\n` +
    `目標受眾：${audience}\n` +
    `平台：${platform}\n` +
    `語氣 / 風格：${tone}\n` +
    (constraint ? `限制條件：${constraint}\n` : "") +
    (reference ? `引用資料：${reference}\n` : "") +
    `輸出格式：${format}\n`;

  document.getElementById('output').value = result;
  outputSection.style.display = 'block';
  dynamicFeedback.innerHTML = `<span>${feedbackMsg}</span> <span style="margin-left:1em;">${randomFeedback[Math.floor(Math.random()*randomFeedback.length)]}</span>`;

  // 成就統計
  let profile = getLocalProfile();
  profile.createCount = (profile.createCount||0) + 1;
  saveProfile(auth.currentUser?.uid, profile);
  checkAndUnlockAchievements(profile);
});

// ==== 一鍵複製、收藏、再優化 ====
document.getElementById('copy-btn').onclick = () => {
  const out = document.getElementById('output');
  out.select(); out.setSelectionRange(0, 99999);
  document.execCommand('copy');
  showToast('已複製到剪貼簿');
};
document.getElementById('save-btn').onclick = async () => {
  if (!auth.currentUser) { showToast("請先登入會員才能收藏"); return; }
  const text = document.getElementById('output').value;
  const group = document.getElementById('group').value.trim();
  if (!text) return showToast("請先產生內容");
  const uid = auth.currentUser.uid;
  const ref = collection(db, "users", uid, "favorites");
  await addDoc(ref, {
    text, group,
    created: Date.now()
  });
  showToast('已加入我的最愛！');
  let profile = getLocalProfile();
  profile.favoriteCount = (profile.favoriteCount||0) + 1;
  saveProfile(uid, profile);
  await renderFavorites();
  checkAndUnlockAchievements(profile);
};

// ==== 我的最愛：渲染、刪除、再優化、複製、匯出 ====
async function renderFavorites() {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  const favsRef = collection(db, "users", uid, "favorites");
  const q = query(favsRef, orderBy("created", "desc"));
  const snap = await getDocs(q);
  const listDiv = document.getElementById('favorites-list');
  listDiv.innerHTML = "";
  snap.forEach(docSnap => {
    const fav = docSnap.data();
    const div = document.createElement('div');
    div.className = "favorite-card";
    div.innerHTML = `
      <div class="favorite-meta">${fav.group ? '分組：' + fav.group + '　' : ''}${new Date(fav.created).toLocaleString()}</div>
      <textarea readonly rows="3">${fav.text}</textarea>
      <div class="favorite-btns">
        <button class="copyfav">複製</button>
        <button class="refine">再優化</button>
        <button class="removefav">刪除</button>
      </div>
    `;
    // 事件
    div.querySelector('.copyfav').onclick = () => {
      const ta = div.querySelector('textarea');
      ta.select(); ta.setSelectionRange(0, 99999);
      document.execCommand('copy');
      showToast('已複製收藏內容');
    };
    div.querySelector('.refine').onclick = () => {
      document.getElementById('output').value = fav.text + "\n\n[AI 建議你可以嘗試不同語氣/目標來優化這組 prompt]";
      outputSection.style.display = 'block';
      showToast('已載入並可再優化');
    };
    div.querySelector('.removefav').onclick = async () => {
      await deleteDoc(doc(favsRef, docSnap.id));
      showToast('已刪除收藏');
      await renderFavorites();
    };
    listDiv.appendChild(div);
  });
}
document.getElementById('export-btn').onclick = async () => {
  if (!auth.currentUser) return;
  const favs = [];
  const snap = await getDocs(query(
    collection(db, 'users', auth.currentUser.uid, 'favorites'), orderBy('created', 'desc')
  ));
  snap.forEach(d => favs.push(d.data()));
  if (!favs.length) return showToast('沒有收藏可匯出');
  let txt = favs.map(f => `[${f.group ? '分組：'+f.group+' ' : ''}]${f.text}`).join('\n\n---\n\n');
  const blob = new Blob([txt], {type: 'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'promptdeck-favorites.txt';
  a.click();
  showToast('已匯出！');
};

// ==== Toast 動畫 ====
function showToast(msg) {
  toastDiv.textContent = msg;
  toastDiv.className = 'toast show';
  setTimeout(() => { toastDiv.className = 'toast'; }, 1800);
}

// ==== 十個完整自動填入的快速範本 ====
const templates = {
  creative_copy: {
    goal: "品牌塑造",
    topic: "新產品上市活動亮點",
    userRole: "社群小編",
    audience: "大眾消費者",
    platform: "ChatGPT",
    tone: "啟發性",
    constraint: "條列五點, 100字內",
    reference: "2024新產品規格",
    format: "簡短描述",
    group: "行銷"
  },
  lesson_plan: {
    goal: "學習成長",
    topic: "五分鐘自學Python",
    userRole: "老師",
    audience: "國中小學生",
    platform: "ChatGPT",
    tone: "輕鬆",
    constraint: "200字內, 要有引導性",
    reference: "官方Python新手指南",
    format: "腳本/多段",
    group: "學習"
  },
  social_post: {
    goal: "趣味互動",
    topic: "母親節祝福短句",
    userRole: "社群小編",
    audience: "Facebook社群粉絲",
    platform: "ChatGPT",
    tone: "溫馨",
    constraint: "20字以內, 要有情感共鳴",
    reference: "粉絲專頁數據",
    format: "簡短描述",
    group: "社群"
  },
  product_review: {
    goal: "效率工作",
    topic: "最新手機開箱心得",
    userRole: "3C部落客",
    audience: "科技愛好者",
    platform: "ChatGPT",
    tone: "專業",
    constraint: "條列優缺點, 150字以內",
    reference: "官方規格表",
    format: "詳細描述",
    group: "科技"
  },
  event_invite: {
    goal: "品牌塑造",
    topic: "品牌講座邀請文",
    userRole: "活動企劃",
    audience: "潛在合作夥伴",
    platform: "ChatGPT",
    tone: "品牌感",
    constraint: "含日期地點, 100字內",
    reference: "官方邀請函模板",
    format: "簡短描述",
    group: "活動"
  },
  faq_support: {
    goal: "效率工作",
    topic: "線上購物常見問題自動回覆",
    userRole: "客服機器人",
    audience: "線上顧客",
    platform: "ChatGPT",
    tone: "專業",
    constraint: "50字內, 語氣友善",
    reference: "購物網站FAQ",
    format: "簡短描述",
    group: "客服"
  },
  resume_bio: {
    goal: "學習成長",
    topic: "行銷專員履歷自傳",
    userRole: "應徵者",
    audience: "人資主管",
    platform: "ChatGPT",
    tone: "專業",
    constraint: "200字內, 強調專案經驗",
    reference: "歷年專案成績單",
    format: "詳細描述",
    group: "職涯"
  },
  ad_headline: {
    goal: "品牌塑造",
    topic: "運動品牌廣告標語",
    userRole: "廣告文案",
    audience: "年輕消費者",
    platform: "ChatGPT",
    tone: "激勵",
    constraint: "10字內, 要有行動力",
    reference: "國內外運動廣告案例",
    format: "簡短描述",
    group: "廣告"
  },
  midjourney_art: {
    goal: "激發創意",
    topic: "貓咪與咖啡廳插畫",
    userRole: "插畫設計師",
    audience: "IG粉絲",
    platform: "Midjourney",
    tone: "詩意",
    constraint: "風格柔和, 高解析",
    reference: "Pinterest靈感圖",
    format: "詳細描述",
    group: "圖像"
  },
  newsletter: {
    goal: "激發創意",
    topic: "品牌電子報開頭段落",
    userRole: "內容編輯",
    audience: "訂閱用戶",
    platform: "ChatGPT",
    tone: "輕鬆",
    constraint: "50字內, 增加閱讀動機",
    reference: "過去電子報",
    format: "簡短描述",
    group: "內容"
  }
};

document.getElementById('template-select').addEventListener('change', function() {
  const t = templates[this.value];
  if (t) {
    document.getElementById('goal').value = t.goal || "";
    document.getElementById('topic').value = t.topic || "";
    document.getElementById('userRole').value = t.userRole || "";
    document.getElementById('audience').value = t.audience || "";
    document.getElementById('platform').value = t.platform || "";
    document.getElementById('tone').value = t.tone || "";
    document.getElementById('constraint').value = t.constraint || "";
    document.getElementById('reference').value = t.reference || "";
    document.getElementById('format').value = t.format || "";
    document.getElementById('group').value = t.group || "";
  }
});

document.getElementById('clear-form').addEventListener('click', function() {
  promptForm.reset();
  document.getElementById('template-select').value = '';
  outputSection.style.display = 'none';
  dynamicFeedback.innerHTML = '';
});

// ==== 成就檢查 ====
function checkAndUnlockAchievements(profile) {
  achievements.forEach(a => {
    let ok = true;
    for (let k in a.condition) {
      if ((profile[k]||0) < a.condition[k]) ok = false;
    }
    if (ok && (!profile.badges || !profile.badges.includes(a.badge))) {
      renderAssistantBubble(`🏅 恭喜獲得成就：「${a.badge}」！${a.message}`);
      profile.badges = profile.badges || [];
      profile.badges.push(a.badge);
      saveProfile(auth.currentUser?.uid, profile);
    }
  });
}
