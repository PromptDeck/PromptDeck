import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

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
const analytics = getAnalytics(app);
const dbInstance = getFirestore(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', function () {
  // ===== 範本全部優化、分類 =====
  const templates = {
    // ...（原有範本全部保留在這裡，省略）
    b2b_intro_mail: {
      goal: "品牌塑造",
      topic: "B2B 業務開發郵件",
      userRole: "業務專員",
      audience: "潛在合作夥伴",
      platform: "ChatGPT",
      tone: "專業",
      constraint: "條列、300字內",
      reference: "公司簡介、產品優勢",
      format: "詳細描述"
    },
    // ...（中間所有原有範本照舊，省略）

    // ===== 專案類 =====
    project_vendor_mail: {
      goal: "課程合作",
      topic: "邀約廠商舉辦課程或專案提案",
      userRole: "企劃人員",
      audience: "潛在合作廠商",
      platform: "ChatGPT",
      tone: "專業且誠懇",
      constraint: "條列清楚合作重點、簡潔易讀",
      reference: "過往合作案例、公司簡介",
      format: "Email 範本"
    },
    project_word_report: {
      goal: "專案規劃",
      topic: "專案企劃書（word 報告）",
      userRole: "專案經理",
      audience: "決策主管、團隊成員",
      platform: "ChatGPT",
      tone: "條理分明、簡潔有力",
      constraint: "包含案由、現況、痛點、規劃方向、行動方案、預期效益、後續時程",
      reference: "公司內部報告模板",
      format: "詳細分段描述"
    },
    project_ppt: {
      goal: "簡報規劃",
      topic: "專案企劃簡報",
      userRole: "專案經理",
      audience: "主管、提案委員",
      platform: "ChatGPT",
      tone: "重點扼要、易懂",
      constraint: "以分頁條列方式說明",
      reference: "簡報範本、競品資料",
      format: "分頁條列"
    },
    project_name: {
      goal: "專案命名",
      topic: "專案名稱命名",
      userRole: "專案負責人",
      audience: "團隊、決策層",
      platform: "ChatGPT",
      tone: "創意、簡潔、有記憶點",
      constraint: "可附上命名邏輯說明",
      reference: "專案背景",
      format: "條列式名稱＋說明"
    },
    meeting_name: {
      goal: "會議命名",
      topic: "會議名稱命名",
      userRole: "會議召集人",
      audience: "團隊成員",
      platform: "ChatGPT",
      tone: "創意、簡潔",
      constraint: "中英文都可",
      reference: "會議主題",
      format: "條列式名稱＋簡述"
    },
    satisfaction_survey: {
      goal: "問卷設計",
      topic: "設計滿意度問卷",
      userRole: "問卷設計者",
      audience: "使用者或客戶",
      platform: "ChatGPT",
      tone: "中立、明確",
      constraint: "條列10題內、題型多元",
      reference: "過往問卷範例",
      format: "問卷題目條列"
    },
    exchange_survey: {
      goal: "問卷設計",
      topic: "設計交流問卷",
      userRole: "問卷設計者",
      audience: "合作夥伴、團隊成員",
      platform: "ChatGPT",
      tone: "開放、鼓勵分享",
      constraint: "開放題、條列6題以內",
      reference: "",
      format: "條列問卷題目"
    }
  };

  function setFormEnabled(enabled) {
    document.querySelectorAll('#prompt-form input, #prompt-form select, #prompt-form textarea, #prompt-form button[type="submit"]')
      .forEach(e => {
        if (e.id !== "template-select" && e.id !== "clear-form")
          e.disabled = !enabled;
        // 視覺強化 disabled 狀態
        if (!enabled) {
          e.classList.add('disabled-strong');
        } else {
          e.classList.remove('disabled-strong');
        }
      });
  }
  setFormEnabled(false);

  document.getElementById('template-select').addEventListener('change', function () {
    const val = this.value;
    if (!val || !templates[val]) {
      setFormEnabled(false);
      document.getElementById('prompt-form').reset();
      document.getElementById('output-section').style.display = 'none';
      return;
    }
    setFormEnabled(true);
    const t = templates[val];
    document.getElementById('goal').value = t.goal || "";
    document.getElementById('topic').value = t.topic || "";
    document.getElementById('userRole').value = t.userRole || "";
    document.getElementById('audience').value = t.audience || "";
    document.getElementById('platform').value = t.platform || "";
    document.getElementById('tone').value = t.tone || "";
    document.getElementById('constraint').value = t.constraint || "";
    document.getElementById('reference').value = t.reference || "";
    document.getElementById('format').value = t.format || "";
    document.getElementById('group').value = "";
  });

  document.getElementById('clear-form').onclick = () => {
    setFormEnabled(false);
    document.getElementById('prompt-form').reset();
    document.getElementById('output-section').style.display = 'none';
  };

  document.getElementById('prompt-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const get = id => document.getElementById(id).value.trim();

    let prompt =
      `請以「${get('tone')}」的語氣，針對「${get('audience')}」，在「${get('platform')}」上，以「${get('format')}」方式，撰寫關於「${get('topic')}」的內容。
身份角色為「${get('userRole')}」，目標是「${get('goal')}」。
${get('constraint') ? "請注意：" + get('constraint') : ""}
${get('reference') ? "可參考資料：" + get('reference') : ""}`;

    document.getElementById('output').value = prompt;
    document.getElementById('output-section').style.display = '';
    // 新增產生結果後自動 focus
    setTimeout(() => {
      document.getElementById('output').focus();
      document.getElementById('output').scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  });

  document.getElementById('copy-btn').onclick = function () {
    const out = document.getElementById('output');
    out.select();
    document.execCommand('copy');
    showToast('已複製到剪貼簿！');
  };

  // 修正版 showToast，讓提示有動畫效果
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => {
      t.classList.remove('show');
    }, 1600);
  }

  // ---- Google 登入/登出 ----
  const loginModal = document.getElementById('login-modal');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userEmail = document.getElementById('user-email');
  let currentUser = null;
  function updateUserUI(user) {
    if (user) {
      userEmail.innerText = user.email;
      userEmail.style.display = 'inline';
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
    } else {
      userEmail.innerText = '';
      userEmail.style.display = 'none';
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
    }
  }

  // modal 顯示隱藏修正
  loginBtn.onclick = () => { 
    loginModal.classList.remove('hidden'); // 顯示 modal
  };
  document.getElementById('modal-close').onclick = () => {
    loginModal.classList.add('hidden'); // 隱藏 modal
  };

  document.getElementById('google-login').onclick = async function () {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      loginModal.classList.add('hidden'); // 登入後隱藏
    } catch (e) {
      alert('Google 登入失敗：' + e.message);
    }
  };
  logoutBtn.onclick = () => signOut(auth);

  // ---- 收藏、留言、匯出 ----
  const db = () => dbInstance;
  const favoritesSection = document.getElementById('favorites-section');
  const favoritesList = document.getElementById('favorites-list');

  document.getElementById('save-btn').onclick = async function () {
    if (!auth.currentUser) {
      showToast('請先登入才能收藏');
      loginModal.classList.remove('hidden'); // 未登入時顯示登入 modal
      return;
    }
    const data = {
      prompt: document.getElementById('output').value,
      group: document.getElementById('group').value,
      email: auth.currentUser.email,
      ts: Date.now()
    };
    await addDoc(collection(db(), "favorites"), data);
    showToast('已收藏到雲端！');
    loadFavorites();
  };

  async function loadFavorites() {
    if (!auth.currentUser) {
      favoritesSection.style.display = 'none';
      return;
    }
    const q = query(
      collection(db(), "favorites"),
      where("email", "==", auth.currentUser.email),
      orderBy("ts", "desc")
    );
    const snap = await getDocs(q);
    favoritesList.innerHTML = '';
    if (snap.empty) {
      favoritesList.innerHTML = '<div style="color:#888;font-size:1.02em;">尚未收藏任何內容</div>';
    } else {
      snap.forEach(docSnap => {
        const d = docSnap.data();
        const div = document.createElement('div');
        div.className = 'favorite-item';
        div.innerHTML = `<pre style="font-size:1em;white-space:pre-wrap;">${d.prompt}</pre>
          <div class="favorite-actions">
            <button onclick="navigator.clipboard.writeText(\`${d.prompt.replace(/`/g, '\\`')}\`).then(()=>window.showToast('已複製'))">複製</button>
            <button onclick="deleteFavorite('${docSnap.id}')">刪除</button>
          </div>
          <div style="color:#8bb7fa;font-size:0.98em;margin-top:4px;">分組：${d.group || '-'}</div>
        `;
        favoritesList.appendChild(div);
      });
    }
    favoritesSection.style.display = 'block';
  }
  window.showToast = showToast;
  window.deleteFavorite = async function (id) {
    if (!window.confirm('確定要刪除嗎？')) return;
    await deleteDoc(doc(db(), "favorites", id));
    loadFavorites();
  };

  document.getElementById('export-btn').onclick = async function () {
    const prompts = Array.from(document.querySelectorAll('.favorite-item pre')).map(e => e.textContent);
    if (prompts.length === 0) return showToast('沒有收藏！');
    const blob = new Blob([prompts.join('\n\n---\n\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'promptdeck_favorites.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  document.getElementById('feedback-form').onsubmit = async function (e) {
    e.preventDefault();
    const msg = document.getElementById('feedback-message').value.trim();
    if (!msg) return;
    await addDoc(collection(db(), "feedbacks"), {
      message: msg,
      email: auth.currentUser ? auth.currentUser.email : '',
      ts: Date.now()
    });
    document.getElementById('feedback-success').innerText = '已收到您的寶貴留言！';
    document.getElementById('feedback-message').value = '';
    setTimeout(() => { document.getElementById('feedback-success').innerText = ''; }, 2500);
  };

  // 每次登入/登出都即時同步顯示「我的最愛」
  onAuthStateChanged(auth, user => {
    currentUser = user;
    updateUserUI(user);
    loadFavorites();
  });

  // ===== 即時必填欄位驗證/紅框提示 =====
  const requiredFields = ['goal','topic','userRole','audience','platform','tone','format'];
  requiredFields.forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('blur', validateField);
    el.addEventListener('input', validateField);
  });
  function validateField(e) {
    if (!e.target.value.trim()) {
      e.target.classList.add('input-error');
      showFieldError(e.target, '此欄位必填');
    } else {
      e.target.classList.remove('input-error');
      removeFieldError(e.target);
    }
  }
  function showFieldError(input, msg) {
    let next = input.nextElementSibling;
    if (next && next.classList && next.classList.contains('input-error-tip')) {
      next.textContent = msg;
    } else {
      let span = document.createElement('span');
      span.className = 'input-error-tip';
      span.style.color = '#e34d3d';
      span.style.fontSize = '0.97em';
      span.style.marginLeft = '5px';
      span.textContent = msg;
      input.parentNode.insertBefore(span, input.nextSibling);
    }
  }
  function removeFieldError(input) {
    let next = input.nextElementSibling;
    if (next && next.classList && next.classList.contains('input-error-tip')) {
      next.remove();
    }
  }

});
