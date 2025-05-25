// [1] Apple 動態引導 & 範本預填（與表單 disable 控制）
const templates = {
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
  meeting_summary: {
    goal: "效率工作",
    topic: "會議紀要重點摘要",
    userRole: "會議記錄者",
    audience: "團隊同事",
    platform: "ChatGPT",
    tone: "專業",
    constraint: "條列、精簡",
    reference: "",
    format: "條列式"
  },
  annual_report: {
    goal: "效率工作",
    topic: "年度業績簡報",
    userRole: "行銷經理",
    audience: "主管、董事會",
    platform: "ChatGPT",
    tone: "專業",
    constraint: "含數據、條列",
    reference: "年度銷售數據、重要事件",
    format: "詳細描述"
  },
  business_reply: {
    goal: "品牌塑造",
    topic: "商務合作回信",
    userRole: "專案經理",
    audience: "潛在合作廠商",
    platform: "ChatGPT",
    tone: "專業",
    constraint: "禮貌、具體回覆",
    reference: "合作條件、先前溝通紀錄",
    format: "簡短描述＋一句展望"
  },
  creative_copy: {
    goal: "激發創意",
    topic: "創意文案",
    userRole: "文案企劃",
    audience: "消費大眾",
    platform: "ChatGPT",
    tone: "啟發性",
    constraint: "20字內",
    reference: "",
    format: "簡短描述"
  },
  ad_headline: {
    goal: "激發創意",
    topic: "廣告標題激發",
    userRole: "行銷企劃",
    audience: "潛在消費者",
    platform: "ChatGPT",
    tone: "激勵",
    constraint: "10字內",
    reference: "",
    format: "條列式"
  },
  event_invite: {
    goal: "激發創意",
    topic: "活動邀請文",
    userRole: "活動企劃",
    audience: "目標參加者",
    platform: "ChatGPT",
    tone: "輕鬆",
    constraint: "",
    reference: "",
    format: "簡短描述＋一句展望"
  },
  social_post: {
    goal: "趣味互動",
    topic: "社群貼文內容",
    userRole: "社群小編",
    audience: "粉絲",
    platform: "ChatGPT",
    tone: "輕鬆",
    constraint: "附上 hashtag",
    reference: "",
    format: "簡短描述"
  },
  newsletter: {
    goal: "品牌塑造",
    topic: "電子報開頭段落",
    userRole: "行銷人員",
    audience: "訂閱者",
    platform: "ChatGPT",
    tone: "溫馨",
    constraint: "",
    reference: "",
    format: "詳細描述"
  },
  faq_support: {
    goal: "效率工作",
    topic: "客服 FAQ 回覆",
    userRole: "客服人員",
    audience: "顧客",
    platform: "ChatGPT",
    tone: "溫馨",
    constraint: "禮貌、迅速",
    reference: "",
    format: "條列式"
  },
  lesson_plan: {
    goal: "學習成長",
    topic: "Python 教學腳本",
    userRole: "老師",
    audience: "初學者",
    platform: "ChatGPT",
    tone: "啟發性",
    constraint: "逐步、淺顯易懂",
    reference: "",
    format: "腳本/多段"
  },
  resume_bio: {
    goal: "學習成長",
    topic: "履歷自傳產生",
    userRole: "求職者",
    audience: "面試官、人資",
    platform: "ChatGPT",
    tone: "專業",
    constraint: "300字以內",
    reference: "學經歷、技能",
    format: "詳細描述"
  },
  product_review: {
    goal: "激發創意",
    topic: "產品開箱心得",
    userRole: "部落客",
    audience: "潛在買家",
    platform: "ChatGPT",
    tone: "品牌感",
    constraint: "誠實、具體",
    reference: "產品說明書",
    format: "簡短描述＋一句展望"
  },
  midjourney_art: {
    goal: "激發創意",
    topic: "Midjourney 圖像指令",
    userRole: "AI 創作者",
    audience: "AI 圖像生成工具",
    platform: "Midjourney",
    tone: "啟發性",
    constraint: "中英對照",
    reference: "",
    format: "條列式"
  }
};

function setFormEnabled(enabled) {
  document.querySelectorAll('#prompt-form input, #prompt-form select, #prompt-form textarea, #prompt-form button[type="submit"]')
    .forEach(e => {
      if (e.id !== "template-select" && e.id !== "clear-form")
        e.disabled = !enabled;
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

// [2] 產生高價值詳細 Prompt
document.getElementById('prompt-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const get = id => document.getElementById(id).value.trim();
  let prompt = 
`【今日目標】${get('goal')}
【主題內容】${get('topic')}
【操作角色】${get('userRole')}
【目標受眾】${get('audience')}
【使用平台】${get('platform')}
【語氣風格】${get('tone')}
【限制條件】${get('constraint')}
${get('reference') ? '【引用資料】' + get('reference') : ''}
【輸出格式】${get('format')}

請根據以上資訊，結構化地為我生成高價值、高可讀性的 AI Prompt，請分段落、條列、重點說明：
1. 首段請「簡述主題與目標」並呼應受眾需求
2. 中段請「具體分段列出行動建議、策略、內容要素」
3. 如有引用資料請整合引用
4. 結尾請給出一句具啟發或鼓勵性的結語
5. 內容務必精緻、詳盡，避免只有一兩句話
`;

  document.getElementById('output').value = prompt;
  document.getElementById('output-section').style.display = '';
});

// [3] 一鍵複製
document.getElementById('copy-btn').onclick = function() {
  const out = document.getElementById('output');
  out.select();
  document.execCommand('copy');
  showToast('已複製到剪貼簿！');
};
// [4] Firebase 初始化、收藏、留言、Google 登入
function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerText = msg;
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 1600);
}

// Google 登入
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
loginBtn.onclick = () => { loginModal.classList.add('show'); };
document.getElementById('modal-close').onclick = () => loginModal.classList.remove('show');
document.getElementById('google-login').onclick = async function() {
  try {
    const provider = new window._GoogleAuthProvider();
    await window._signInWithPopup(window._auth, provider);
    loginModal.classList.remove('show');
  } catch (e) {
    alert('Google 登入失敗：' + e.message);
  }
};
logoutBtn.onclick = () => window._signOut(window._auth);

window._onAuthStateChanged && window._onAuthStateChanged(window._auth, user => {
  currentUser = user;
  updateUserUI(user);
  loadFavorites();
});

// [5] 收藏功能
const db = () => window._db;
const favoritesSection = document.getElementById('favorites-section');
const favoritesList = document.getElementById('favorites-list');
document.getElementById('save-btn').onclick = async function() {
  if (!currentUser) {
    showToast('請先登入才能收藏');
    loginModal.classList.add('show');
    return;
  }
  const data = {
    prompt: document.getElementById('output').value,
    group: document.getElementById('group').value,
    email: currentUser.email,
    ts: Date.now()
  };
  await window._addDoc(window._collection(db(), "favorites"), data);
  showToast('已收藏到雲端！');
  loadFavorites();
};

async function loadFavorites() {
  if (!currentUser) {
    favoritesSection.style.display = 'none';
    return;
  }
  const q = window._query(window._collection(db(), "favorites"), window._where("email", "==", currentUser.email), window._orderBy("ts", "desc"));
  const snap = await window._getDocs(q);
  favoritesList.innerHTML = '';
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
  favoritesSection.style.display = 'block';
}
window.showToast = showToast;
window.deleteFavorite = async function(id) {
  if (!window.confirm('確定要刪除嗎？')) return;
  await window._deleteDoc(window._doc(db(), "favorites", id));
  loadFavorites();
};

// 一鍵匯出
document.getElementById('export-btn').onclick = async function() {
  const prompts = Array.from(document.querySelectorAll('.favorite-item pre')).map(e => e.textContent);
  if (prompts.length === 0) return showToast('沒有收藏！');
  const blob = new Blob([prompts.join('\n\n---\n\n')], {type: 'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'promptdeck_favorites.txt';
  a.click();
  URL.revokeObjectURL(a.href);
};

// [6] 用戶留言
document.getElementById('feedback-form').onsubmit = async function(e) {
  e.preventDefault();
  const msg = document.getElementById('feedback-message').value.trim();
  if (!msg) return;
  await window._addDoc(window._collection(db(), "feedbacks"), {
    message: msg,
    email: currentUser ? currentUser.email : '',
    ts: Date.now()
  });
  document.getElementById('feedback-success').innerText = '已收到您的寶貴留言！';
  document.getElementById('feedback-message').value = '';
  setTimeout(() => { document.getElementById('feedback-success').innerText = ''; }, 2500);
};
