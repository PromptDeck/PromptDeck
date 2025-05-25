// --- Firebase 基本設定 --- //
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

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
const db = getFirestore(app);

// --- 狀態管理 --- //
let currentUser = null;
let userFavorites = [];
let favoritesCache = [];
let lastPrompt = null;

// --- 範本（含預設內容） --- //
const templates = {
  b2b_intro_mail: {
    topic: "產品合作提案",
    userRole: "業務經理",
    audience: "潛在企業客戶（B2B）",
    platform: "ChatGPT",
    tone: "專業",
    format: "條列式",
    constraint: "總長不少於350字，內容具體分段，結尾需有行動呼籲",
    reference: "自家公司介紹、官網資訊"
  },
  meeting_summary: {
    topic: "專案進度會議",
    userRole: "專案經理",
    audience: "專案團隊成員",
    platform: "通用",
    tone: "專業",
    format: "條列式",
    constraint: "每點超過60字，需有結論與待追蹤事項",
    reference: "本次會議記錄"
  },
  annual_report: {
    topic: "年度營運成果",
    userRole: "行銷主管",
    audience: "公司高層、合作夥伴",
    platform: "ChatGPT",
    tone: "專業",
    format: "條列式",
    constraint: "需涵蓋三大面向，超過350字",
    reference: "年度財報、主管訪談紀要"
  },
  business_reply: {
    topic: "詢問合作進度",
    userRole: "業務助理",
    audience: "合作廠商窗口",
    platform: "通用",
    tone: "禮貌、正面",
    format: "簡短描述＋一句展望",
    constraint: "需正面積極、結尾再次強調合作期待",
    reference: ""
  },
  creative_copy: {
    topic: "新品上市活動宣傳",
    userRole: "文案企劃",
    audience: "社群大眾",
    platform: "ChatGPT",
    tone: "激勵",
    format: "腳本/多段",
    constraint: "需有創意、段落分明",
    reference: ""
  },
  ad_headline: {
    topic: "夏日促銷活動",
    userRole: "廣告投放人員",
    audience: "潛在消費者",
    platform: "通用",
    tone: "輕鬆",
    format: "條列式",
    constraint: "三組標語，每組不超過15字",
    reference: ""
  },
  event_invite: {
    topic: "品牌粉絲見面會",
    userRole: "社群小編",
    audience: "品牌忠實粉絲",
    platform: "社群平台",
    tone: "溫馨",
    format: "簡短描述＋一句展望",
    constraint: "",
    reference: ""
  },
  social_post: {
    topic: "世界環境日宣導",
    userRole: "社群小編",
    audience: "社群粉絲",
    platform: "社群平台",
    tone: "啟發性",
    format: "腳本/多段",
    constraint: "",
    reference: ""
  },
  newsletter: {
    topic: "產品改版通知",
    userRole: "品牌經理",
    audience: "訂閱電子報的用戶",
    platform: "電子報",
    tone: "專業",
    format: "簡短描述",
    constraint: "",
    reference: ""
  },
  faq_support: {
    topic: "退換貨常見問題",
    userRole: "客服專員",
    audience: "消費者",
    platform: "通用",
    tone: "專業",
    format: "條列式",
    constraint: "",
    reference: ""
  },
  lesson_plan: {
    topic: "Python基礎教學",
    userRole: "講師",
    audience: "初學者",
    platform: "教學簡報",
    tone: "溫馨",
    format: "腳本/多段",
    constraint: "",
    reference: ""
  },
  resume_bio: {
    topic: "個人簡歷自傳",
    userRole: "求職者",
    audience: "HR主管",
    platform: "ChatGPT",
    tone: "專業",
    format: "詳細描述",
    constraint: "內容條理分明、包含經歷亮點",
    reference: ""
  },
  product_review: {
    topic: "智慧型手機開箱心得",
    userRole: "開箱達人",
    audience: "科技愛好者",
    platform: "通用",
    tone: "輕鬆",
    format: "條列式",
    constraint: "",
    reference: ""
  },
  midjourney_art: {
    topic: "未來主義城市夜景",
    userRole: "影像創作者",
    audience: "Midjourney平台用戶",
    platform: "Midjourney",
    tone: "詩意",
    format: "條列式",
    constraint: "描述請包含光影、色調、風格",
    reference: ""
  }
};

// --- 高價值專業 Prompt 產生器 --- //
function generateHighValuePrompt(inputs, templateType = "") {
  let minTotalLength = 350; // 字數要求
  let structure = [];
  let extraSections = [];

  // 不同範本結構
  switch (templateType) {
    case "b2b_intro_mail":
      structure = [
        "1. 【主題背景】：描述產品特色、合作機會、產業趨勢，最少80字。",
        "2. 【合作亮點】：條列三大合作優勢（數據/具體效益），每點不少於60字。",
        "3. 【實際案例】：舉一個成功合作或模擬情境。",
        "4. 【常見疑慮與解答】：預想2個常見問題並回覆。",
        "5. 【行動邀請】：明確呼籲對方回信或安排會議。"
      ];
      extraSections.push("請用積極、專業、清晰語氣，避免空泛敘述。");
      break;
    case "meeting_summary":
      structure = [
        "1. 【會議簡介】：簡要說明會議主題、日期、參與人。",
        "2. 【討論重點】：條列三個以上討論結論，每點超過60字。",
        "3. 【待追蹤事項】：條列需追蹤議題與負責人。",
        "4. 【會議結語】：一句正向鼓勵或行動呼籲。"
      ];
      break;
    case "annual_report":
      structure = [
        "1. 【年度成果摘要】：描述整體營運成績與目標達成度。",
        "2. 【成功案例】：舉例說明代表性案例或亮點。",
        "3. 【挑戰與展望】：分析困難、提出未來策略。",
        "4. 【收尾展望】：提出未來規劃與勉勵。"
      ];
      break;
    case "business_reply":
      structure = [
        "1. 【開頭致意】：簡短回應、致謝。",
        "2. 【需求回覆】：針對對方來信明確回應。",
        "3. 【合作誠意】：再次表達合作期待。",
        "4. 【結尾邀請】：請對方有任何需求隨時聯絡。"
      ];
      break;
    default:
      structure = [
        "1. 【主題背景】：說明主題、目標、需求或挑戰。",
        "2. 【內容重點】：條列三大重點，每點不少於60字。",
        "3. 【應用舉例】：舉1-2個實際案例或常見場景。",
        "4. 【FAQ或行動呼籲】：可列一個常見疑問與建議解法，並有一句收尾鼓勵。"
      ];
      break;
  }

  // 進階提示
  if (inputs.constraint) extraSections.push("請務必遵守以下限制：" + inputs.constraint);
  if (inputs.reference) extraSections.push("請適當引用或整合以下資料來源：" + inputs.reference);
  if (inputs.format) extraSections.push("輸出格式採用【" + inputs.format + "】，請分段條列、層次分明。");

  extraSections.push("最後請自動檢查內容有無遺漏關鍵重點，並補充不足之處。字數至少" + minTotalLength + "字，內容需有邏輯、細節和專業感。");

  return `
你是${inputs.userRole}，目標是為${inputs.audience}在${inputs.platform}平台撰寫主題「${inputs.topic}」內容，語氣請以${inputs.tone}為主。

請依下列結構詳細產出：
${structure.join('\n')}

${extraSections.join('\n')}
  `.trim();
}

// --- 登入與登出 --- //
const loginModal = document.getElementById('login-modal');
const userDisplay = document.getElementById('user-display');
const googleLoginBtn = document.getElementById('google-login');
const modalCloseBtn = document.getElementById('modal-close');
const toast = document.getElementById('toast');

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      userDisplay.innerHTML = `<span>${user.email}</span><button id="logout-btn">登出</button>`;
      document.getElementById('favorites-section').style.display = 'block';
      await loadFavorites();
      document.getElementById('welcome-area').innerHTML = `<div class="welcome-message">👋 歡迎回來，${user.displayName || user.email}！</div>`;
      setLogoutHandler();
    } else {
      currentUser = null;
      userFavorites = [];
      favoritesCache = [];
      userDisplay.innerHTML = `<button id="login-btn">登入 / 註冊</button>`;
      document.getElementById('favorites-section').style.display = 'none';
      document.getElementById('welcome-area').innerHTML = `<div class="welcome-message">✍️ 立即註冊收藏你的雲端最愛，跨裝置同步！</div>`;
      setLoginHandler();
    }
  });

  setLoginHandler();
  initForm();
  setupTemplateSelection();
  setupFeedbackForm();
});

function setLoginHandler() {
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.onclick = () => {
      loginModal.classList.remove('hidden');
    };
  }
  googleLoginBtn.onclick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      loginModal.classList.add('hidden');
    } catch (err) {
      showToast("登入失敗，請檢查瀏覽器是否支援 Google 登入！");
    }
  };
  modalCloseBtn.onclick = () => {
    loginModal.classList.add('hidden');
  };
}

function setLogoutHandler() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await signOut(auth);
      showToast("已登出");
    };
  }
}

// --- 表單初始化、提交、快速帶入 --- //
function initForm() {
  const form = document.getElementById('prompt-form');
  const outputSection = document.getElementById('output-section');
  const output = document.getElementById('output');
  const copyBtn = document.getElementById('copy-btn');
  const saveBtn = document.getElementById('save-btn');
  const saveMessage = document.getElementById('save-message');
  const clearBtn = document.getElementById('clear-form');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const templateType = document.getElementById('template-select').value;
    const inputs = {
      topic: document.getElementById('topic').value,
      userRole: document.getElementById('userRole').value,
      audience: document.getElementById('audience').value,
      platform: document.getElementById('platform').value,
      tone: document.getElementById('tone').value,
      constraint: document.getElementById('constraint').value,
      reference: document.getElementById('reference').value,
      format: document.getElementById('format').value,
      group: document.getElementById('group').value,
    };

    const prompt = generateHighValuePrompt(inputs, templateType);
    lastPrompt = { ...inputs, prompt, ts: new Date() };

    output.value = prompt;
    outputSection.style.display = 'block';
    document.getElementById('dynamic-feedback').innerHTML = getRandomAiFeedback();
    saveMessage.textContent = '';
  });

  copyBtn.onclick = function() {
    const promptText = output.value;
    navigator.clipboard.writeText(promptText).then(() => {
      showToast("已複製到剪貼簿！");
    });
  };

  saveBtn.onclick = async function() {
    if (!currentUser) {
      showToast("請先登入後才能收藏");
      return;
    }
    if (!lastPrompt) {
      showToast("請先產生一個 Prompt 再收藏");
      return;
    }
    const favorite = {
      ...lastPrompt,
      uid: currentUser.uid,
      email: currentUser.email,
      group: lastPrompt.group || '',
      createdAt: Timestamp.now()
    };
    try {
      await addDoc(collection(db, "favorites"), favorite);
      showToast("收藏成功！");
      await loadFavorites();
    } catch (err) {
      showToast("收藏失敗，請稍後再試");
    }
  };

  clearBtn.onclick = function() {
    form.reset();
    outputSection.style.display = 'none';
    lastPrompt = null;
  };
}

function setupTemplateSelection() {
  const select = document.getElementById('template-select');
  select.onchange = function() {
    const type = select.value;
    if (!type || !templates[type]) return;
    Object.entries(templates[type]).forEach(([k, v]) => {
      if (document.getElementById(k)) document.getElementById(k).value = v;
    });
  };
}

// --- 動態 AI 回饋 --- //
function getRandomAiFeedback() {
  const feedbackList = [
    "🤖 AI小秘書：這份 prompt 很棒，建議再加入一個案例會更豐富！",
    "✨ 已根據你的輸入自動展開內容，歡迎加入更多細節！",
    "🎯 精準目標，已優化語氣與結構！",
    "🚀 AI小助手：內容已依據主題專業擴充，推薦儲存下次再用！",
    "🪄 若想產出更長內容，請填寫「限制」與「引用資料」！",
    "📚 AI根據你的設定加入分段說明，若需更客製化可再調整語氣。"
  ];
  return feedbackList[Math.floor(Math.random() * feedbackList.length)];
}

// --- 雲端我的最愛 --- //
async function loadFavorites() {
  if (!currentUser) return;
  const favoritesList = document.getElementById('favorites-list');
  favoritesList.innerHTML = '載入中…';
  const q = query(collection(db, "favorites"),
    where("uid", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  userFavorites = [];
  favoritesCache = [];
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    data.id = docSnap.id;
    userFavorites.push(data);
    favoritesCache.push(data);
  });
  renderFavorites();
}

function renderFavorites() {
  const favoritesList = document.getElementById('favorites-list');
  if (userFavorites.length === 0) {
    favoritesList.innerHTML = "<div style='color:#888;'>目前尚無收藏</div>";
    return;
  }
  favoritesList.innerHTML = "";
  userFavorites.forEach((fav, idx) => {
    const el = document.createElement('div');
    el.className = "favorite-item";
    el.innerHTML = `
      <div class="fav-meta">分組：${fav.group || '-'}　${formatDateTime(fav.ts || fav.createdAt)}</div>
      <textarea readonly rows="4">${fav.prompt}</textarea>
      <div class="fav-actions">
        <button class="btn-secondary" data-copy="${idx}">複製</button>
        <button class="btn-secondary" data-remove="${fav.id}">刪除</button>
      </div>
    `;
    favoritesList.appendChild(el);
  });

  document.querySelectorAll('.fav-actions button[data-copy]').forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(btn.getAttribute('data-copy'));
      navigator.clipboard.writeText(userFavorites[idx].prompt).then(() => {
        showToast("已複製收藏內容！");
      });
    };
  });
  document.querySelectorAll('.fav-actions button[data-remove]').forEach(btn => {
    btn.onclick = async function() {
      const id = btn.getAttribute('data-remove');
      await deleteDoc(doc(db, "favorites", id));
      showToast("已刪除收藏");
      await loadFavorites();
    };
  });
}

// --- 實用小函式 --- //
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function formatDateTime(ts) {
  let d = (ts instanceof Date) ? ts : (ts?.toDate ? ts.toDate() : new Date());
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
}

// --- 留言板 --- //
function setupFeedbackForm() {
  const feedbackForm = document.getElementById('feedback-form');
  if (!feedbackForm) return;
  feedbackForm.onsubmit = async function(e) {
    e.preventDefault();
    const msg = document.getElementById('feedback-message').value.trim();
    if (!msg) return showToast('請輸入留言內容');
    await addDoc(collection(db, "feedbacks"), {
      text: msg,
      email: currentUser ? currentUser.email : "",
      ts: Timestamp.now()
    });
    feedbackForm.reset();
    showToast('已收到留言，感謝您的建議！');
  };
}
