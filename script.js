import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
  getFirestore, collection, addDoc, query,
  orderBy, getDocs, deleteDoc, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

// 初始化 Firebase
const firebaseConfig = { /* 你的配置 */
  apiKey: "AIzaSyDPE6...",
  authDomain: "promptdeck-8366f.firebaseapp.com",
  projectId: "promptdeck-8366f",
  storageBucket: "promptdeck-8366f.appspot.com",
  messagingSenderId: "1047872909519",
  appId: "1:1047872909519:web:5fe6b0e35d109d63de07ba"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// DOM
const loginModal = document.getElementById('login-modal');
const userDisplay = document.getElementById('user-display');
const promptForm = document.getElementById('prompt-form');
const outputSection = document.getElementById('output-section');
const favoritesSection = document.getElementById('favorites-section');

// 監聽登入狀態
onAuthStateChanged(auth, async user => {
  renderUser(user);
  if (user) await renderFavorites();
});

// 顯示使用者狀態
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

// Modal
document.getElementById('modal-close').onclick = () => loginModal.classList.add('hidden');
window.onclick = e => { if (e.target === loginModal) loginModal.classList.add('hidden'); };

document.getElementById('google-login').onclick = async () => {
  try { await signInWithPopup(auth, provider); loginModal.classList.add('hidden'); }
  catch (e) { alert('Google 登入失敗：' + e.message); }
};

// Email 註冊
document.getElementById('registerForm').onsubmit = async e => {
  e.preventDefault();
  const email = e.target.regEmail.value;
  const pw = e.target.regPassword.value;
  try {
    await createUserWithEmailAndPassword(auth, email, pw);
    alert('註冊成功'); loginModal.classList.add('hidden');
  } catch (err) { alert('註冊失敗：' + err.message); }
};

// Email 登入
document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  const email = e.target.loginEmail.value;
  const pw = e.target.loginPassword.value;
  try {
    await signInWithEmailAndPassword(auth, email, pw);
    alert('登入成功'); loginModal.classList.add('hidden');
  } catch (err) { alert('登入失敗：' + err.message); }
};

// 產生 Prompt
promptForm.onsubmit = e => {
  e.preventDefault();
  const topic = e.target.topic.value.trim();
  const role  = e.target.userRole.value.trim();
  const aud   = e.target.audience.value.trim();
  const pl    = e.target.platform.value;
  const tone  = e.target.tone.value;
  const fmt   = e.target.format.value;
  let prompt = `你是${role}，請以「${tone}」帶給「${aud}」，圍繞「${topic}」，產出${fmt}`;
  document.getElementById('output').value = prompt;
  outputSection.style.display = 'block';
};

// 收藏
document.getElementById('save-btn').onclick = async () => {
  if (!auth.currentUser) {
    alert('請先登入'); document.getElementById('showLogin').click(); return;
  }
  const text = document.getElementById('output').value;
  await addDoc(collection(db, 'users', auth.currentUser.uid, 'favorites'), { text, created: Date.now() });
  showToast('加入最愛');
  renderFavorites();
};

// 渲染收藏
async function renderFavorites() {
  if (!auth.currentUser) return;
  const favs = [];
  const snap = await getDocs(query(
    collection(db, 'users', auth.currentUser.uid, 'favorites'), orderBy('created', 'desc')
  ));
  snap.forEach(d => favs.push({ id: d.id, ...d.data() }));
  const list = document.getElementById('favorites-list');
  list.innerHTML = favs.map(f => 
    `<div class="favorite-card">
      <div>${f.text}</div>
      <button onclick="deleteFav('${f.id}')">刪除</button>
    </div>`).join('');
}
window.deleteFav = async id => {
  await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'favorites', id));
  renderFavorites();
};

// Toast
function showToast(msg) {
  const t = document.createElement('div');
  t.className='toast'; t.textContent=msg;
  document.body.append(t);
  setTimeout(()=>t.remove(),1500);
}
