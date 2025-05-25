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
    constraint: "總長不少於300字，內容具體分段，結尾需有行動呼籲",
    reference: "自家公司介紹、官網資訊"
  },
  meeting_summary: {
    topic: "專案進度會議",
    userRole: "專案經理",
    audience: "專案團隊成員",
    platform: "通用",
    tone: "專業",
    format: "條列式",
    constraint: "每點超過30字，需有結論與待追蹤事項",
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

// --- 主函式：根據 user 輸入產生高價值 Prompt --- //
function generateDetailedPrompt(inputs, templateType = "") {
  let advancedIntro = "";
  let advancedBody = "";
  let advancedFooter = "";

  switch (templateType) {
    case "b2b_intro_mail":
      advancedIntro = "請以親切、專業、具體的語氣，自我介紹並說明寫信動機。";
      advancedBody = "信中要包含自家公司簡介、合作亮點、可帶來的價值，並分段說明。";
      advancedFooter = "結尾請有清楚行動邀請，並提供聯絡方式。";
      break;
    case "meeting_summary":
      advancedIntro = "請條列說明會議主題、會議日期與參與人員。";
      advancedBody = "重點摘要要涵蓋三個以上討論重點，每點說明需超過30字。";
      advancedFooter = "最後請加入「待追蹤事項」與「結語」。";
      break;
    case "annual_report":
      advancedIntro = "以專業、邏輯嚴謹方式撰寫年度業績摘要。";
      advancedBody = "內容需包含：1. 總體業績數據 2. 成功案例 3. 面臨挑戰與未來展望。";
      advancedFooter = "請用條列方式呈現，結尾提供一段展望語。";
      break;
    case "business_reply":
      advancedIntro = "請用禮貌、正面、專業的語氣撰寫回信內容。";
      advancedBody = "開頭簡短致意，說明收到對方信件，內容要明確回應需求並表達合作誠意。";
      advancedFooter = "結尾請再次強調合作期待與聯絡方式。";
      break;
    default:
      advancedIntro = `請用${inputs.tone}語氣，針對主題詳細展開說明，不要只寫一句話。`;
      advancedBody = `內容要分段，包含主題說明、三個具體建議或重點，每點用${inputs.format}展現。`;
      advancedFooter = `結尾請呼應受眾需求，並提出鼓勵/行動呼籲。`;
      break;
  }

  return `
你現在是一位${inputs.userRole}，目標是為${inputs.audience}在${inputs.platform}平台，主題「${inputs.topic}」創作內容。
${advancedIntro}
${advancedBody}
${inputs.constraint ? '限制條件：' + inputs.constraint : ''}
${inputs.reference ? '引用資料：' + inputs.reference : ''}
${advancedFooter}
總內容請有條理、有深度，務必達到200字以上。
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

    const prompt = generateDetailedPrompt(inputs, templateType);
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

// --- 動態 AI 回饋（讓 AI 感） --- //
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
