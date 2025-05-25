// ---------- templates（全部預設）----------
const templates = {
  // 商務應用
  b2b_intro_mail: {
    goal: "拓展企業客戶",
    topic: "新SaaS產品陌生開發郵件",
    userRole: "業務開發經理",
    audience: "企業決策者",
    platform: "Email/ChatGPT",
    tone: "專業、誠懇",
    constraint: "條列優勢、字數不超過300字",
    reference: "",
    format: "條列＋邀約行動",
    prompt: `
請協助我撰寫一封B2B業務開發郵件，主題為「{{topic}}」。
- 收件人對象為{{audience}}。
- 我是{{userRole}}。
- 本產品主要優勢請條列2-3點。
- 語氣請保持{{tone}}。
- 結尾加入友善邀約行動（如：是否可安排會議深入交流）。
- 內容請簡明扼要，符合{{constraint}}。
`
  },
  annual_report: {
    goal: "年度成果彙整",
    topic: "2024年品牌行銷績效簡報",
    userRole: "行銷經理",
    audience: "公司高層、部門同仁",
    platform: "PowerPoint/ChatGPT",
    tone: "專業、條理分明",
    constraint: "每項重點限50字",
    reference: "Google Analytics數據",
    format: "條列式、分段說明",
    prompt: `
請幫我產出一份{{topic}}的簡報大綱。
- 身份：{{userRole}}
- 受眾：{{audience}}
- 資料來源：{{reference}}
- 請以{{tone}}，將年度亮點、成長數據、主要策略與未來展望分段條列。
- 各點不超過{{constraint}}。
`
  },
  business_reply: {
    goal: "回覆合作邀約",
    topic: "合作提案回信",
    userRole: "品牌負責人",
    audience: "潛在合作夥伴",
    platform: "Email",
    tone: "專業、友善、積極",
    constraint: "",
    reference: "",
    format: "標準商業書信格式",
    prompt: `
請協助我撰寫一封回覆合作邀約的商業郵件，主題為「{{topic}}」。
- 我的身份是{{userRole}}。
- 收件人是{{audience}}。
- 語氣請用{{tone}}，展現開放合作的態度。
- 內容需回應對方重點、簡要介紹自身優勢、提出後續行動建議。
- 請用{{format}}。
`
  },
  cover_letter: {
    goal: "求職申請",
    topic: "數位行銷專員應徵信",
    userRole: "求職者",
    audience: "人資/部門主管",
    platform: "Email/LinkedIn",
    tone: "誠懇、專業、自信",
    constraint: "",
    reference: "履歷重點",
    format: "3段式",
    prompt: `
請產出一份{{topic}}的求職信。
- 身份：{{userRole}}
- 受眾：{{audience}}
- 請用{{tone}}自我介紹、說明應徵動機，並依據{{reference}}突顯個人亮點。
- 全文請以{{format}}撰寫。
`
  },
  edm_email: {
    goal: "行銷推廣",
    topic: "新品上市 EDM",
    userRole: "行銷人員",
    audience: "潛在消費者",
    platform: "電子報",
    tone: "吸引人、活潑",
    constraint: "標題10字以內，主文80字內",
    reference: "",
    format: "標題＋主文＋CTA",
    prompt: `
請協助產生{{topic}}的EDM文案。
- 角色：{{userRole}}
- 受眾：{{audience}}
- 請給我1句吸睛標題（{{constraint}}），1段主文（強調商品亮點），以及一個明確的行動呼籲。
- 內容格式：{{format}}
`
  },
  meeting_summary: {
    goal: "記錄與摘要",
    topic: "行銷策略會議紀要",
    userRole: "會議記錄者",
    audience: "全體與會人員",
    platform: "Google Docs/ChatGPT",
    tone: "中立、精簡",
    constraint: "條列五點",
    reference: "",
    format: "條列摘要",
    prompt: `
請針對「{{topic}}」撰寫一份條列式會議紀要。
- 角色：{{userRole}}
- 受眾：{{audience}}
- 重點條列五點，包含主要決議、分工事項與追蹤進度。
- 語氣：{{tone}}
`
  },

  // 學習／個人
  lesson_plan: {
    goal: "課程設計",
    topic: "Python初學教學腳本",
    userRole: "講師",
    audience: "零基礎新手",
    platform: "ChatGPT/教學簡報",
    tone: "清楚易懂、鼓勵式",
    constraint: "",
    reference: "",
    format: "逐步條列＋說明",
    prompt: `
我需要一份{{topic}}。
- 角色：{{userRole}}
- 對象：{{audience}}
- 請依教學邏輯，條列課程章節、每章要點、舉例、並加勉勵語。
- 語氣：{{tone}}
- 輸出格式：{{format}}
`
  },
  study_notes: {
    goal: "整理學習重點",
    topic: "AI專題重點筆記",
    userRole: "學生",
    audience: "自己",
    platform: "Notion/ChatGPT",
    tone: "摘要、條理清楚",
    constraint: "每點20字",
    reference: "",
    format: "條列＋小結",
    prompt: `
針對「{{topic}}」，幫我整理筆記。
- 角色：{{userRole}}
- 受眾：{{audience}}
- 重點摘要、每點{{constraint}}，最後加一小結。
- 語氣：{{tone}}
`
  },
  resume_bio: {
    goal: "履歷亮點凸顯",
    topic: "履歷自傳內容",
    userRole: "應徵者",
    audience: "面試官",
    platform: "ChatGPT",
    tone: "專業、自信",
    constraint: "",
    reference: "",
    format: "段落式",
    prompt: `
請根據下列資訊產生一段{{topic}}：
- 角色：{{userRole}}
- 受眾：{{audience}}
- 請展現能力、經驗與個人特色。
- 請以{{tone}}語氣，{{format}}撰寫。
`
  },

  // 創意／行銷
  creative_copy: {
    goal: "激發創意",
    topic: "品牌社群行銷文案",
    userRole: "文案企劃",
    audience: "品牌粉絲",
    platform: "社群/ChatGPT",
    tone: "輕鬆、有趣",
    constraint: "",
    reference: "",
    format: "三句式＋emoji",
    prompt: `
我要一段「{{topic}}」。
- 角色：{{userRole}}
- 受眾：{{audience}}
- 請用{{tone}}，用三句式搭配emoji，主題鮮明。
- 可加入流行語/時事。
`
  },
  ad_headline: {
    goal: "激發標題靈感",
    topic: "廣告標語激發",
    userRole: "行銷企劃",
    audience: "產品目標客群",
    platform: "廣告/ChatGPT",
    tone: "吸引人、創意",
    constraint: "10字內",
    reference: "",
    format: "五個選項",
    prompt: `
幫我想5個「{{topic}}」。
- 角色：{{userRole}}
- 對象：{{audience}}
- 每個標題{{constraint}}。
- 語氣：{{tone}}
`
  },
  event_invite: {
    goal: "活動宣傳",
    topic: "品牌新品發表會邀請文",
    userRole: "公關",
    audience: "媒體與VIP客戶",
    platform: "Email/社群",
    tone: "誠懇、盛情邀約",
    constraint: "",
    reference: "",
    format: "段落＋亮點條列",
    prompt: `
請協助產生「{{topic}}」邀請文。
- 角色：{{userRole}}
- 對象：{{audience}}
- 語氣：{{tone}}
- 內容包含活動主題、地點、時間、兩大亮點。
- 格式：{{format}}
`
  },
  youtube_script: {
    goal: "影片腳本生成",
    topic: "產品開箱YouTube腳本",
    userRole: "YouTuber",
    audience: "產品愛好者",
    platform: "YouTube",
    tone: "活潑、口語",
    constraint: "",
    reference: "",
    format: "段落＋重點條列",
    prompt: `
請幫我生成{{topic}}。
- 角色：{{userRole}}
- 觀眾：{{audience}}
- 開頭引起興趣，接著條列特色，結尾引導留言/訂閱。
- 語氣：{{tone}}
`
  },

  // 社群／內容
  social_post: {
    goal: "社群經營",
    topic: "品牌新產品上市貼文",
    userRole: "社群小編",
    audience: "品牌粉絲",
    platform: "Facebook/Instagram",
    tone: "輕鬆、生活感",
    constraint: "",
    reference: "",
    format: "一段＋hashtag",
    prompt: `
產生一則「{{topic}}」。
- 角色：{{userRole}}
- 對象：{{audience}}
- 請用{{tone}}，一段文字＋三組hashtag。
- 可附一句提問與互動。
`
  },
  newsletter: {
    goal: "電子報行銷",
    topic: "品牌月報開頭段落",
    userRole: "內容行銷",
    audience: "訂閱用戶",
    platform: "Email",
    tone: "溫馨、啟發性",
    constraint: "",
    reference: "",
    format: "一段文字",
    prompt: `
請產生「{{topic}}」。
- 角色：{{userRole}}
- 受眾：{{audience}}
- 內容須溫馨開場＋本期亮點預告。
- 語氣：{{tone}}
- {{format}}
`
  },
  faq_support: {
    goal: "自動客服回覆",
    topic: "線上購物常見問答",
    userRole: "客服AI",
    audience: "消費者",
    platform: "ChatGPT",
    tone: "禮貌、親切",
    constraint: "",
    reference: "",
    format: "三問三答",
    prompt: `
請針對「{{topic}}」產生三個常見問答對。
- 角色：{{userRole}}
- 對象：{{audience}}
- 語氣：{{tone}}
`
  },

  // 產品／SEO
  product_review: {
    goal: "產品體驗分享",
    topic: "新款無線耳機開箱",
    userRole: "3C部落客",
    audience: "消費者",
    platform: "部落格/ChatGPT",
    tone: "專業、真實",
    constraint: "",
    reference: "",
    format: "條列＋段落",
    prompt: `
請生成{{topic}}的開箱文。
- 角色：{{userRole}}
- 受眾：{{audience}}
- 請條列三大特色、優缺點，並給一段總結感想。
- 語氣：{{tone}}
`
  },
  product_faq: {
    goal: "FAQ產生",
    topic: "新產品常見問答",
    userRole: "客服/產品經理",
    audience: "消費者",
    platform: "ChatGPT",
    tone: "清楚、專業",
    constraint: "",
    reference: "",
    format: "五問五答",
    prompt: `
針對「{{topic}}」，請給五組問答。
- 角色：{{userRole}}
- 對象：{{audience}}
- 格式：{{format}}
- 語氣：{{tone}}
`
  },
  seo_title: {
    goal: "SEO優化",
    topic: "網站首頁SEO標題與關鍵字",
    userRole: "SEO專員",
    audience: "搜尋引擎",
    platform: "Google/Bing",
    tone: "簡潔、具吸引力",
    constraint: "",
    reference: "",
    format: "五組標題+關鍵字",
    prompt: `
針對「{{topic}}」，產生五組SEO標題和對應關鍵字。
- 角色：{{userRole}}
- 平台：{{platform}}
- 語氣：{{tone}}
`
  },

  // 圖像生成
  midjourney_art: {
    goal: "圖像生成描述",
    topic: "日出下的城市天際線插畫",
    userRole: "設計師",
    audience: "Midjourney AI",
    platform: "Midjourney",
    tone: "藝術、抽象",
    constraint: "畫面色調明亮、風格極簡",
    reference: "",
    format: "英文敘述",
    prompt: `
產生一段Midjourney圖像生成英文描述：
- 主題：{{topic}}
- 角色：{{userRole}}
- 受眾：{{audience}}
- 語氣風格：{{tone}}
- 限制條件：{{constraint}}
`
  }
};
// ---------- End templates ----------

// ------------------- 主要功能 -----------------
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

document.getElementById('prompt-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const tval = document.getElementById('template-select').value;
  const t = templates[tval];
  let output = "";
  if (t && t.prompt) {
    output = t.prompt
      .replace(/\{\{goal\}\}/g, document.getElementById('goal').value)
      .replace(/\{\{topic\}\}/g, document.getElementById('topic').value)
      .replace(/\{\{userRole\}\}/g, document.getElementById('userRole').value)
      .replace(/\{\{audience\}\}/g, document.getElementById('audience').value)
      .replace(/\{\{platform\}\}/g, document.getElementById('platform').value)
      .replace(/\{\{tone\}\}/g, document.getElementById('tone').value)
      .replace(/\{\{constraint\}\}/g, document.getElementById('constraint').value)
      .replace(/\{\{reference\}\}/g, document.getElementById('reference').value)
      .replace(/\{\{format\}\}/g, document.getElementById('format').value)
      .trim();
    output = `【主題】${t.topic}\n【目標受眾】${t.audience}\n${output}`;
  } else {
    const get = id => document.getElementById(id).value.trim();
    output =
      `你現在是一位${get('userRole')}，請根據下列需求產出一段AI指令：
主題：「${get('topic')}」
目標受眾：「${get('audience')}」
平台：「${get('platform')}」
語氣風格：「${get('tone')}」
${get('constraint') ? '限制條件：「' + get('constraint') + '」' : ''}
${get('reference') ? '引用資料：「' + get('reference') + '」' : ''}
輸出格式：「${get('format')}」

請生成完整、結構化的內容，並針對主題重點及受眾需求，展現專業與創意。
`;
  }
  document.getElementById('output').value = output;
  document.getElementById('output-section').style.display = '';
});

// ----------- 複製功能 -----------
document.getElementById('copy-btn').onclick = function () {
  const txt = document.getElementById('output').value;
  if (!txt) return;
  navigator.clipboard.writeText(txt).then(() => {
    showToast('已複製！');
  });
};

// ----------- 收藏功能 (Firebase) -----------
async function getCurrentUser() {
  return new Promise(res => {
    window._onAuthStateChanged(window._auth, user => res(user));
  });
}
async function saveFavorite() {
  const user = await getCurrentUser();
  if (!user) return showToast('請先登入再收藏');
  const prompt = document.getElementById('output').value;
  if (!prompt) return showToast('請先產生 prompt');
  const group = document.getElementById('group').value || "";
  const now = new Date();
  await window._addDoc(window._collection(window._db, "favorites"), {
    uid: user.uid,
    email: user.email,
    prompt,
    group,
    created: now
  });
  showToast('已加入我的最愛！');
  loadFavorites();
}
document.getElementById('save-btn').onclick = saveFavorite;

// ----------- 我的最愛/雲端收藏 -----------
async function loadFavorites() {
  const user = await getCurrentUser();
  const favSection = document.getElementById('favorites-section');
  const favList = document.getElementById('favorites-list');
  if (!user) { favSection.style.display = 'none'; return; }
  favSection.style.display = '';
  favList.innerHTML = "<div style='color:#aaa;'>讀取中...</div>";
  const q = window._query(window._collection(window._db, "favorites"),
    window._where("uid", "==", user.uid),
    window._orderBy("created", "desc")
  );
  const snapshot = await window._getDocs(q);
  let html = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    html += `
      <div class="favorite-item">
        <textarea readonly style="width:99%;background:transparent;border:none;">${data.prompt}</textarea>
        <div class="favorite-actions">
          <button onclick="navigator.clipboard.writeText(\`${data.prompt.replace(/`/g,"\\`")}\`);showToast('已複製收藏！')">複製</button>
          <button onclick="deleteFavorite('${docSnap.id}')">刪除</button>
          ${data.group ? `<span style="font-size:0.95em;color:#888;margin-left:8px;">#${data.group}</span>` : ""}
        </div>
      </div>
    `;
  });
  favList.innerHTML = html || "<div style='color:#aaa;'>尚無收藏紀錄</div>";
}
window.loadFavorites = loadFavorites;
async function deleteFavorite(docId) {
  await window._deleteDoc(window._doc(window._db, "favorites", docId));
  showToast('已刪除！');
  loadFavorites();
}
window.deleteFavorite = deleteFavorite;

document.getElementById('export-btn').onclick = async function () {
  const user = await getCurrentUser();
  if (!user) return showToast('請先登入');
  const q = window._query(window._collection(window._db, "favorites"),
    window._where("uid", "==", user.uid),
    window._orderBy("created", "desc")
  );
  const snapshot = await window._getDocs(q);
  let text = "";
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    text += d.prompt + "\n\n";
  });
  if (!text) return showToast('沒有收藏可匯出');
  const blob = new Blob([text], {type:"text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = "promptdeck-favorites.txt";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
};

// ----------- Google 登入/登出 -----------
function showLoginModal() {
  document.getElementById('login-modal').classList.add('show');
}
function hideLoginModal() {
  document.getElementById('login-modal').classList.remove('show');
}
document.getElementById('login-btn').onclick = showLoginModal;
document.getElementById('modal-close').onclick = hideLoginModal;
document.getElementById('google-login').onclick = async function () {
  const provider = new window._GoogleAuthProvider();
  try {
    await window._signInWithPopup(window._auth, provider);
    hideLoginModal();
    showToast('登入成功！');
    updateUserDisplay();
    loadFavorites();
  } catch {
    showToast('登入失敗，請再試一次');
  }
};
document.getElementById('logout-btn').onclick = async function () {
  await window._signOut(window._auth);
  updateUserDisplay();
  loadFavorites();
};

// ----------- 會員狀態顯示 -----------
function updateUserDisplay() {
  window._onAuthStateChanged(window._auth, function(user) {
    const display = document.getElementById('user-display');
    const email = document.getElementById('user-email');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    if (user) {
      email.textContent = user.email; email.style.display = '';
      loginBtn.style.display = 'none'; logoutBtn.style.display = '';
      loadFavorites();
    } else {
      email.textContent = ""; email.style.display = 'none';
      loginBtn.style.display = ''; logoutBtn.style.display = 'none';
      document.getElementById('favorites-section').style.display = 'none';
    }
  });
}
updateUserDisplay();

// ----------- 留言（Feedback） -----------
document.getElementById('feedback-form').onsubmit = async function (e) {
  e.preventDefault();
  const msg = document.getElementById('feedback-message').value.trim();
  if (!msg) return;
  await window._addDoc(window._collection(window._db, "feedbacks"), {
    message: msg,
    created: new Date()
  });
  document.getElementById('feedback-success').textContent = "感謝您的留言！";
  document.getElementById('feedback-message').value = "";
  setTimeout(() => { document.getElementById('feedback-success').textContent = ""; }, 2500);
};

// ----------- Toast 訊息 -----------
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.display = "block";
  setTimeout(() => { t.style.display = "none"; }, 2000);
}
window.showToast = showToast;
