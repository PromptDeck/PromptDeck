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

// ======= Firebase config =======
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

// ====== DOM 物件 ======
const loginModal = document.getElementById('login-modal');
const userDisplay = document.getElementById('user-display');
const promptForm = document.getElementById('prompt-form');
const outputSection = document.getElementById('output-section');
const favoritesSection = document.getElementById('favorites-section');
const toastDiv = document.getElementById('toast');
const welcomeArea = document.getElementById('welcome-area');
const dynamicFeedback = document.getElementById('dynamic-feedback');
const assistantBubble = document.getElementById('assistant-bubble');

// ======= 登入與用戶顯示 =======
onAuthStateChanged(auth, async user => {
  if (user) {
    userDisplay.innerHTML =
      `<span class="user-mail">${user.email || user.displayName}</span>
       <button id="logoutBtn" class="logout-btn">登出</button>`;
    document.getElementById('logoutBtn').onclick = () => signOut(auth);
    favoritesSection.style.display = 'block';
    await renderFavorites();
  } else {
    userDisplay.innerHTML = `<span class="login-link" id="showLogin">登入 / 註冊</span>`;
    document.getElementById('showLogin').onclick = () => loginModal.classList.remove('hidden');
    favoritesSection.style.display = 'none';
  }
});
document.getElementById('modal-close').onclick = () => loginModal.classList.add('hidden');
window.onclick = e => { if (e.target === loginModal) loginModal.classList.add('hidden'); };
document.getElementById('google-login').onclick = async () => {
  try { await signInWithPopup(auth, provider); loginModal.classList.add('hidden'); }
  catch (e) { showToast('Google 登入失敗'); }
};

// ==== prompt 產生 ====
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
  // 組合 prompt
  let result =
    `目標：${goal}\n` +
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
  dynamicFeedback.innerHTML = `<span>已根據你的選擇客製化產生 prompt。</span>`;
});

// ==== 一鍵複製、收藏 ====
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
  await renderFavorites();
};

// ==== 我的最愛 ====
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
        <button class="removefav">刪除</button>
      </div>
    `;
    div.querySelector('.copyfav').onclick = () => {
      const ta = div.querySelector('textarea');
      ta.select(); ta.setSelectionRange(0, 99999);
      document.execCommand('copy');
      showToast('已複製收藏內容');
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

// ==== 範本資料：已依分組排序，含四個商務範本 ====
const templates = {
  // ======= 商務應用 =======
  b2b_intro_mail: {
    goal: "效率工作",
    topic: "B2B 客戶開發首次聯絡信",
    userRole: "業務代表",
    audience: "企業決策人／採購經理",
    platform: "ChatGPT",
    tone: "專業",
    constraint: "100字內、明確說明合作價值、留下聯絡方式",
    reference: "公司簡介重點",
    format: "簡短描述",
    group: "商務"
  },
  meeting_summary: {
    goal: "效率工作",
    topic: "會議紀要快速整理與重點摘要",
    userRole: "專案經理",
    audience: "團隊成員、主管",
    platform: "ChatGPT",
    tone: "專業",
    constraint: "條列3-5點、每點不超過30字",
    reference: "本次會議重點",
    format: "條列式",
    group: "商務"
  },
  annual_report: {
    goal: "品牌塑造",
    topic: "年度業績報告簡報重點",
    userRole: "高階主管",
    audience: "公司全體同仁／投資人",
    platform: "ChatGPT",
    tone: "啟發性",
    constraint: "包含成長數據、展望一句話",
    reference: "本年度業績數據、趨勢分析",
    format: "簡短描述＋一句展望",
    group: "商務"
  },
  business_reply: {
    goal: "效率工作",
    topic: "商務合作詢問之正式回覆",
    userRole: "業務／專案經理／客服",
    audience: "合作夥伴／客戶",
    platform: "ChatGPT",
    tone: "專業",
    constraint: "50-100字內，包含感謝、回應要點與後續聯絡方式",
    reference: "來信內容摘要／合作重點",
    format: "簡短描述",
    group: "商務"
  },
  // ======= 創意／行銷 =======
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
  // ======= 社群／內容 =======
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
  // ======= 學習／個人 =======
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
  // ======= 圖像生成 =======
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

// === 用戶留言功能 ===
const feedbackForm = document.getElementById('feedback-form');
const feedbackMsgDiv = document.getElementById('feedback-success');

if (feedbackForm) {
  feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('feedback-message').value.trim();
    if (!msg) {
      feedbackMsgDiv.textContent = "請填寫留言內容";
      return;
    }
    if (!auth.currentUser) {
      feedbackMsgDiv.textContent = "請先登入會員才能留言！";
      return;
    }
    // 留言寫入 Firestore
    try {
      await addDoc(collection(db, "feedbacks"), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        message: msg,
        created: Date.now()
      });
      feedbackMsgDiv.textContent = "感謝您的留言與回饋！";
      feedbackForm.reset();
      setTimeout(() => { feedbackMsgDiv.textContent = ""; }, 2000);
    } catch (e) {
      feedbackMsgDiv.textContent = "留言失敗，請稍後再試。";
    }
  });
}
