// script.js (完整版，可直接串接 Firebase)
// 1. 請先在 Firebase 控制台啟用 Authentication (Google Sign-In) 與 Firestore
// 2. 若功能異常，請確認 firebase 的安全規則允許登入用戶存取與寫入收藏和留言

// ========== 1. Firebase 初始化 ==========

// 直接使用你之前提供的 config
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

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

// ========== 2. 範本資料 ==========

const templates = {
  "business_reply": {
    name: "商務合作回信",
    goal: "效率工作",
    topic: "回覆貴司關於雙方合作提案的具體建議與合作模式。",
    userRole: "業務主管、商務專員",
    audience: "合作企業窗口、對方業務主管",
    platform: "通用",
    tone: "專業",
    constraint: "條列重點、語氣清楚明確",
    reference: "雙方往來郵件、合約草案",
    format: "條列式"
  },
  "meeting_summary": {
    name: "會議紀要摘要",
    goal: "效率工作",
    topic: "本次專案討論會議重點與決策事項。",
    userRole: "會議記錄人員",
    audience: "全體與會人員、專案成員",
    platform: "通用",
    tone: "專業",
    constraint: "重點摘要於200字以內，避免冗長",
    reference: "會議簡報、討論內容",
    format: "條列式"
  },
  "annual_report": {
    name: "年度業績簡報",
    goal: "品牌塑造",
    topic: "本年度公司營運成果與未來展望重點摘要。",
    userRole: "主管、經理人",
    audience: "公司內部成員、董事會",
    platform: "通用",
    tone: "專業",
    constraint: "重點突出、附簡要數據",
    reference: "財報數據、內部簡報",
    format: "條列式"
  },
  "b2b_intro_mail": {
    name: "業務開發郵件（B2B）",
    goal: "效率工作",
    topic: "向潛在企業客戶介紹我們的產品/服務，爭取進一步合作機會。",
    userRole: "業務開發、行銷人員",
    audience: "企業採購或決策人員",
    platform: "通用",
    tone: "專業",
    constraint: "簡明扼要、強調產品優勢",
    reference: "產品型錄、官網資訊",
    format: "簡短描述＋一句展望"
  },
  "creative_copy": {
    name: "創意文案",
    goal: "激發創意",
    topic: "針對新產品上市設計吸引人的行銷文案。",
    userRole: "行銷企劃、文案人員",
    audience: "大眾消費者",
    platform: "通用",
    tone: "啟發性",
    constraint: "精簡、具創意、可轉發",
    reference: "產品特色說明、競品資料",
    format: "簡短描述"
  },
  "ad_headline": {
    name: "廣告標題激發",
    goal: "激發創意",
    topic: "為行銷活動或商品撰寫吸引人的廣告標題。",
    userRole: "行銷、廣告企劃",
    audience: "目標客群",
    platform: "通用",
    tone: "激勵",
    constraint: "限制12字內、要能引發點擊",
    reference: "行銷活動主題、產品亮點",
    format: "條列式"
  },
  "event_invite": {
    name: "活動邀請文",
    goal: "品牌塑造",
    topic: "邀請目標對象參加公司舉辦的線上或實體活動。",
    userRole: "活動企劃、品牌經理",
    audience: "潛在客戶或合作夥伴",
    platform: "通用",
    tone: "溫馨",
    constraint: "資訊完整、附活動亮點",
    reference: "活動頁面、活動資訊",
    format: "簡短描述"
  },
  "social_post": {
    name: "社群貼文",
    goal: "品牌塑造",
    topic: "撰寫吸引粉絲互動的品牌社群貼文。",
    userRole: "社群小編、行銷人員",
    audience: "社群粉絲、潛在消費者",
    platform: "ChatGPT",
    tone: "輕鬆",
    constraint: "結尾附帶互動問題",
    reference: "品牌官方資訊",
    format: "簡短描述"
  },
  "newsletter": {
    name: "電子報開頭段落",
    goal: "品牌塑造",
    topic: "撰寫本期電子報的開場引言，簡要說明內容亮點。",
    userRole: "內容編輯、行銷人員",
    audience: "電子報訂閱者",
    platform: "通用",
    tone: "品牌感",
    constraint: "不超過70字、語氣友善",
    reference: "本期重點內容",
    format: "簡短描述"
  },
  "faq_support": {
    name: "FAQ 客服自動回覆",
    goal: "效率工作",
    topic: "針對常見問題自動生成客服回覆內容。",
    userRole: "客服人員",
    audience: "一般消費者、客戶",
    platform: "通用",
    tone: "專業",
    constraint: "語氣友善、簡單易懂",
    reference: "產品FAQ、官網說明",
    format: "條列式"
  },
  "lesson_plan": {
    name: "教學腳本",
    goal: "學習成長",
    topic: "設計一份清楚有趣的教學腳本，包含步驟和重點。",
    userRole: "講師、教師",
    audience: "學生或學員",
    platform: "通用",
    tone: "啟發性",
    constraint: "條列清楚、每步驟50字以內",
    reference: "教材大綱、課程目標",
    format: "腳本/多段"
  },
  "resume_bio": {
    name: "履歷自傳生成",
    goal: "學習成長",
    topic: "協助生成一段亮點自傳，用於履歷或LinkedIn。",
    userRole: "求職者、轉職者",
    audience: "人資主管、面試官",
    platform: "通用",
    tone: "專業",
    constraint: "150字內，強調個人優勢",
    reference: "過往經歷、成就",
    format: "簡短描述"
  },
  "product_review": {
    name: "產品開箱心得",
    goal: "趣味互動",
    topic: "撰寫個人產品開箱體驗與優缺點分享。",
    userRole: "消費者、KOL",
    audience: "潛在消費者",
    platform: "通用",
    tone: "輕鬆",
    constraint: "內容真實、可具體列舉優缺點",
    reference: "產品規格、個人使用心得",
    format: "條列式"
  },
  "midjourney_art": {
    name: "Midjourney 圖像描述",
    goal: "激發創意",
    topic: "協助撰寫 Midjourney AI 圖像生成描述詞（Prompt）。",
    userRole: "設計師、創作者",
    audience: "AI 圖像生成社群",
    platform: "Midjourney",
    tone: "詩意",
    constraint: "英文描述、條列主題元素",
    reference: "想要呈現的主題風格",
    format: "條列式"
  }
};


// ========== 3. DOM 物件 ==========
const userDisplay = document.getElementById("user-display");
const loginModal = document.getElementById("login-modal");
const googleLoginBtn = document.getElementById("google-login");
const modalCloseBtn = document.getElementById("modal-close");
const templateSelect = document.getElementById("template-select");
const form = document.getElementById("prompt-form");
const outputSection = document.getElementById("output-section");
const outputTextarea = document.getElementById("output");
const copyBtn = document.getElementById("copy-btn");
const saveBtn = document.getElementById("save-btn");
const favoritesSection = document.getElementById("favorites-section");
const favoritesList = document.getElementById("favorites-list");
const exportBtn = document.getElementById("export-btn");
const toast = document.getElementById("toast");
const clearFormBtn = document.getElementById("clear-form");

// ========== 4. 狀態 ==========
let currentUser = null;
let favorites = []; // 雲端最愛列表

// ========== 5. Firebase 登入登出 ==========
function updateUserUI(user) {
  if (user) {
    userDisplay.innerHTML = `
      <span>${user.email}</span>
      <button id="logout-btn">登出</button>
    `;
    document.getElementById("logout-btn").onclick = async () => {
      await signOut(auth);
    };
  } else {
    userDisplay.innerHTML = `<button id="show-login">登入 / 註冊</button>`;
    document.getElementById("show-login").onclick = () => {
      loginModal.classList.remove("hidden");
    };
  }
}
onAuthStateChanged(auth, user => {
  currentUser = user;
  updateUserUI(user);
  if (user) loadFavorites();
  else {
    favorites = [];
    renderFavorites();
  }
});

// Google 登入
googleLoginBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
    loginModal.classList.add("hidden");
    showToast("登入成功！");
  } catch (e) {
    showToast("登入失敗：" + e.message);
  }
};
modalCloseBtn.onclick = () => loginModal.classList.add("hidden");

// ========== 6. 範本自動帶入 ==========
templateSelect.onchange = () => {
  const val = templateSelect.value;
  if (templates[val]) {
    setForm(templates[val]);
  } else {
    clearForm();
  }
};
clearFormBtn.onclick = () => {
  templateSelect.value = "";
  clearForm();
};

function setForm(tpl) {
  form.goal.value = tpl.goal || "";
  form.topic.value = tpl.topic || "";
  form.userRole.value = tpl.userRole || "";
  form.audience.value = tpl.audience || "";
  form.platform.value = tpl.platform || "";
  form.tone.value = tpl.tone || "";
  form.constraint.value = tpl.constraint || "";
  form.reference.value = tpl.reference || "";
  form.format.value = tpl.format || "";
}
function clearForm() {
  form.reset();
  outputSection.style.display = "none";
}

// ========== 7. 產生 Prompt ==========
form.onsubmit = e => {
  e.preventDefault();
  const prompt = generatePrompt();
  outputTextarea.value = prompt;
  outputSection.style.display = "";
  showToast("已產生專屬 Prompt，可直接複製或收藏！");
};

function generatePrompt() {
  const val = f => form[f]?.value?.trim() || "";
  // **依範本可客製化結構**（可根據不同範本調整語氣/段落）
  return `
【目標】${val("goal")}
【主題內容】${val("topic")}
【使用者角色】${val("userRole")}
【目標受眾】${val("audience")}
【平台】${val("platform")}
【語氣/風格】${val("tone")}
${val("constraint") ? `【限制條件】${val("constraint")}` : ""}
${val("reference") ? `【引用資料】${val("reference")}` : ""}
【輸出格式】${val("format")}

請根據以上資訊，產出專業、清楚且實用的 AI Prompt！
  `.trim();
}

// ========== 8. 複製 ==========
copyBtn.onclick = () => {
  outputTextarea.select();
  document.execCommand("copy");
  showToast("已複製到剪貼簿！");
};

// ========== 9. 收藏 (雲端 Firestore) ==========
saveBtn.onclick = async () => {
  if (!currentUser) {
    loginModal.classList.remove("hidden");
    showToast("請先登入後再收藏！");
    return;
  }
  const data = {
    ...Object.fromEntries(new FormData(form)),
    content: outputTextarea.value,
    createdAt: serverTimestamp(),
    user: currentUser.uid
  };
  await addDoc(collection(db, "favorites"), data);
  showToast("已收藏到雲端！");
  loadFavorites();
};

// 讀取雲端最愛
async function loadFavorites() {
  if (!currentUser) return;
  const q = query(
    collection(db, "favorites"),
    where("user", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  favorites = [];
  querySnapshot.forEach(doc => {
    favorites.push({ id: doc.id, ...doc.data() });
  });
  renderFavorites();
}

// 顯示最愛
function renderFavorites() {
  if (!favoritesSection) return;
  favoritesSection.style.display = currentUser && favorites.length ? "" : "none";
  favoritesList.innerHTML = favorites.map(fav => `
    <div class="fav-item">
      <pre>${fav.content}</pre>
      <button onclick="copyFav('${fav.id}')">複製</button>
      <button onclick="delFav('${fav.id}')">刪除</button>
    </div>
  `).join("");
}
// 複製/刪除最愛（用 window 避免 onclick 找不到函式）
window.copyFav = id => {
  const fav = favorites.find(f => f.id === id);
  if (fav) {
    navigator.clipboard.writeText(fav.content);
    showToast("已複製收藏！");
  }
};
window.delFav = async id => {
  await deleteDoc(doc(db, "favorites", id));
  showToast("已刪除收藏");
  loadFavorites();
};

// ========== 10. 一鍵匯出 ==========
exportBtn.onclick = () => {
  const all = favorites.map(f => f.content).join("\n\n---\n\n");
  const blob = new Blob([all], {type:"text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "promptdeck_favorites.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// ========== 11. 留言區 Firestore ==========
const feedbackForm = document.getElementById("feedback-form");
if (feedbackForm) {
  feedbackForm.onsubmit = async e => {
    e.preventDefault();
    const msg = feedbackForm["feedback-message"].value.trim();
    if (!msg) return showToast("請輸入留言內容！");
    await addDoc(collection(db, "feedbacks"), {
      user: currentUser?.email || "訪客",
      message: msg,
      createdAt: serverTimestamp()
    });
    showToast("感謝您的留言！");
    feedbackForm.reset();
  };
}

// ========== 12. Toast (彈跳提示) ==========
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 2000);
}

// ========== 13. 首次載入 ==========
clearForm();
outputSection.style.display = "none";

// ========== END ==========
