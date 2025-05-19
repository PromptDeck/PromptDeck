import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

const firebaseConfig = { /* 你的 firebase config */ 
  apiKey: "AIzaSyDPE6TL1HbFbIHnRZnL1uHX0sv3AYNr9dQ",
  authDomain: "promptdeck-8366f.firebaseapp.com",
  projectId: "promptdeck-8366f",
  storageBucket: "promptdeck-8366f.firebasestorage.app",
  messagingSenderId: "1047872909519",
  appId: "1:1047872909519:web:5fe6b0e35d109d63de07ba"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

const loginModal = document.getElementById('login-modal');
const userDisplay = document.getElementById('user-display');
function renderUser(user) {
  if (user) {
    userDisplay.innerHTML = `<span>${user.email || user.displayName}</span><button id="logoutBtn" class="logout-btn">登出</button>`;
    document.getElementById('logoutBtn').onclick = () => { signOut(auth); };
    renderFavorites();
  } else {
    userDisplay.innerHTML = `<span class="login-link" id="showLogin">登入 / 註冊</span>`;
    document.getElementById('showLogin').onclick = () => { loginModal.style.display = 'flex'; };
    document.getElementById("favorites-section").style.display = "none";
  }
}
onAuthStateChanged(auth, user => { renderUser(user); });

document.getElementById('modal-close').onclick = function(){ loginModal.style.display = 'none'; };
window.onclick = function(e){ if(e.target === loginModal){ loginModal.style.display = 'none'; } };

document.getElementById("google-login").onclick = async () => {
  try { await signInWithPopup(auth, provider); loginModal.style.display = 'none'; }
  catch (e) { alert('Google 登入失敗：' + e.message); }
};
document.getElementById('registerForm').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert('註冊成功'); loginModal.style.display = 'none';
  } catch (error) { alert('註冊失敗：' + error.message); }
};
document.getElementById('loginForm').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert('登入成功'); loginModal.style.display = 'none';
  } catch (error) { alert('登入失敗：' + error.message); }
};

document.getElementById("prompt-form").onsubmit = function (e) {
  e.preventDefault();
  let prompt = `${document.getElementById("topic").value}, ${document.getElementById("userRole").value}, ${document.getElementById("audience").value}`;
  document.getElementById("output").value = prompt;
  document.getElementById("output-section").style.display = "block";
};

document.getElementById("save-btn").onclick = async function () {
  if (!auth.currentUser) {
    alert('需登入才能收藏'); document.getElementById('showLogin').click(); return;
  }
  const promptText = document.getElementById("output").value.trim();
  if (!promptText) return;
  await addDoc(collection(db, "users", auth.currentUser.uid, "favorites"), { text: promptText });
  renderFavorites();
};

async function renderFavorites() {
  if (!auth.currentUser) return;
  const favCol = collection(db, "users", auth.currentUser.uid, "favorites");
  const snap = await getDocs(query(favCol));
  let arr = [];
  snap.forEach(doc => { arr.push({ ...doc.data(), id: doc.id }); });
  const favoritesList = document.getElementById("favorites-list");
  favoritesList.innerHTML = arr.map(item => `
    <div>
      <span>${item.text}</span>
      <button onclick="window.deleteFavorite('${item.id}')">刪除</button>
    </div>
  `).join("");
  document.getElementById("favorites-section").style.display = arr.length ? "" : "none";
}
window.deleteFavorite = async function(id) {
  await deleteDoc(doc(db, "users", auth.currentUser.uid, "favorites", id));
  renderFavorites();
};
