import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
  getFirestore, collection, addDoc, query,
  orderBy, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

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

const loginModal = document.getElementById('login-modal');
const userDisplay = document.getElementById('user-display');
const promptForm = document.getElementById('prompt-form');
const outputSection = document.getElementById('output-section');
const favoritesSection = document.getElementById('favorites-section');
const toastDiv = document.getElementById('toast');

// 會員狀態監聽
onAuthStateChanged(auth, user => {
  renderUser(user);
  if (user) renderFavorites();
});

function renderUser(user) {
  if (user) {
    userDisplay.innerHTML =
      `<span class="user-mail">${user.email || user.displayName}</span>
       <button id="logoutBtn" class="logout-btn">登出</button>`;
    document.getElementById('logoutBtn').onclick = () => signOut(auth);
    favoritesSection.style.display = 'block';
  } else {
    userDisplay.innerHTML = `<span class="login-link" id="showLogin">登入 / 註冊</span>`;
    document.getElementById('showLogin').onclick = () => loginModal.classList.remove('hidden');
    favoritesSection.style.display = 'none';
  }
}

// 登入 Modal 控制
document.getElementById('modal-close').onclick = () => loginModal.classList.add('hidden');
window.onclick = e => { if (e.target === loginModal) loginModal.classList.add('hidden'); };

document.getElementById('google-login').onclick = async () => {
  try { await signInWithPopup(auth, provider); loginModal.classList.add('hidden'); }
  catch (e) { showToast('Google 登入失敗'); }
};

document.getElementById('registerForm').onsubmit = async e => {
  e.preventDefault();
  const email = e.target.regEmail.value;
  const pw = e.target.regPassword.value;
  try {
    await createUserWithEmailAndPassword(auth, email, pw);
    showToast('註冊成功'); loginModal.classList.add('hidden');
  } catch (err) { showToast('註冊失敗：' + err.message); }
};

document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  const email = e.target.loginEmail.value;
  const pw = e.target.loginPassword.value;
  try {
    await signInWithEmailAndPassword(auth, email, pw);
    showToast('登入成功'); loginModal.classList.add('hidden');
  } catch (err) { showToast('登入失敗：' + err.message); }
};

// ----- Prompt 產生顯示於下方 -----
promptForm.onsubmit = function (e) {
  e.preventDefault();
  const userRole = document.getElementById('userRole').value.trim();
  const audience = document.getElementById('audience').value.trim();
  const topic = document.getElementById('topic').value.trim();
  const platform = document.getElementById('platform').value;
  const tone = document.getElementById('tone').value;
  const constraint = document.getElementById('constraint').value.trim();
  const format = document.getElementById('format').value;

  let prompt = `你是${userRole}，請以${tone}語氣，針對「${audience}」，圍繞主題「${topic}」產生${format}`;
  if (constraint) prompt += `（${constraint}）`;
  prompt += `。\n（適用於 ${platform}）`;

  document.getElementById('output').value = prompt;
  outputSection.style.display = 'block';
};

document.getElementById('copy-btn').onclick = () => {
  const out = document.getElementById('output').value;
  navigator.clipboard.writeText(out).then(()=>showToast('已複製到剪貼簿！'));
};

// 優化加入我的最愛
document.getElementById('save-btn').onclick = async () => {
  const btn = document.getElementById('save-btn');
  btn.disabled = true; // 避免連點
  try {
    if (!auth.currentUser) {
      showToast('請先登入會員才能收藏！');
      document.getElementById('showLogin').click();
      btn.disabled = false;
      return;
    }
    const text = document.getElementById('output').value.trim();
    const group = document.getElementById('group').value.trim();
    if (!text) {
      showToast('無內容可收藏');
      btn.disabled = false;
      return;
    }
    // 檢查是否已存在完全相同的內容（可選擇要不要加這段）
    // const snap = await getDocs(query(collection(db, 'users', auth.currentUser.uid, 'favorites'), where('text', '==', text)));
    // if (!snap.empty) {
    //   showToast('已經收藏過囉！');
    //   btn.disabled = false;
    //   return;
    // }
    await addDoc(collection(db, 'users', auth.currentUser.uid, 'favorites'), {
      text, group, created: Date.now()
    });
    showToast('已加入最愛！');
    renderFavorites();
  } catch (err) {
    showToast('收藏失敗：' + err.message);
  }
  btn.disabled = false;
};

async function renderFavorites() {
  if (!auth.currentUser) return;
  const favs = [];
  const snap = await getDocs(query(
    collection(db, 'users', auth.currentUser.uid, 'favorites'),
    orderBy('created', 'desc')
  ));
  favs.length = 0;
  snap.forEach(d => favs.push({ id: d.id, ...d.data() }));
  const list = document.getElementById('favorites-list');
  if (!favs.length) {
    list.innerHTML = '<div style="color:var(--subtext);padding:1.5em;text-align:center;">尚無收藏，產生並收藏你第一個 Prompt 吧！</div>';
    return;
  }
  list.innerHTML = favs.map(f =>
    `<div class="favorite-card">
      <div class="favorite-content">${f.text.replace(/\n/g, '<br>')}</div>
      ${f.group ? `<div class="favorite-meta">分組：${f.group}</div>` : ''}
      <div class="favorite-btns">
        <button onclick="window.copyFav('${f.id}')">複製</button>
        <button onclick="window.deleteFav('${f.id}')">刪除</button>
      </div>
    </div>`).join('');
}
window.copyFav = async id => {
  const docSnap = await getDocs(query(collection(db, 'users', auth.currentUser.uid, 'favorites')));
  let txt = "";
  docSnap.forEach(d => { if (d.id === id) txt = d.data().text; });
  if (txt) {
    navigator.clipboard.writeText(txt);
    showToast('已複製收藏');
  }
};
window.deleteFav = async id => {
  await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'favorites', id));
  showToast('已刪除收藏');
  renderFavorites();
};

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

// Toast
function showToast(msg) {
  toastDiv.textContent = msg;
  toastDiv.className = 'toast show';
  setTimeout(() => { toastDiv.className = 'toast'; }, 1600);
}

// 快速範本
const templates = {
  creative_copy: {
    topic: "新產品上市活動亮點",
    userRole: "社群小編",
    audience: "大眾消費者",
    platform: "ChatGPT",
    tone: "啟發性",
    constraint: "條列五點, 100字內",
    format: "簡短描述",
    group: "行銷"
  },
  lesson_plan: {
    topic: "五分鐘自學Python",
    userRole: "老師",
    audience: "國中小學生",
    platform: "ChatGPT",
    tone: "輕鬆",
    constraint: "200字內, 要有引導性",
    format: "腳本/多段",
    group: "學習"
  },
  social_post: {
    topic: "母親節祝福短句",
    userRole: "社群小編",
    audience: "Facebook社群粉絲",
    platform: "ChatGPT",
    tone: "溫馨",
    constraint: "20字以內, 要有情感共鳴",
    format: "簡短描述",
    group: "社群"
  }
};
document.getElementById('template-select').addEventListener('change', function() {
  const t = templates[this.value];
  if (t) {
    document.getElementById('topic').value = t.topic;
    document.getElementById('userRole').value = t.userRole;
    document.getElementById('audience').value = t.audience;
    document.getElementById('platform').value = t.platform;
    document.getElementById('tone').value = t.tone;
    document.getElementById('constraint').value = t.constraint;
    document.getElementById('format').value = t.format;
    document.getElementById('group').value = t.group;
  }
});
document.getElementById('clear-form').addEventListener('click', function() {
  promptForm.reset();
  document.getElementById('template-select').value = '';
  outputSection.style.display = 'none';
});
