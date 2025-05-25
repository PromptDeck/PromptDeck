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
    format: "詳細描述",
    prompt: `
請協助產生一封B2B陌生開發郵件，結構如下：
1. 開頭簡短自我介紹及主旨說明
2. 說明產品/服務主要優勢（條列2-3點）
3. 強調與對方合作的潛力（可舉產業/數據證明）
4. 結尾友善邀約後續聯繫（附CTA）
內容請保持專業簡潔，總字數約300字以內。
`
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
    format: "詳細描述",
    prompt: `
請產生一份年度業績簡報重點，結構如下：
1. 年度業績/成長概述（首段3行）
2. 主要數據條列（如營收/成長率/新客/回購等）
3. 關鍵成功要素/重大事件
4. 結尾一句展望未來
內容需條理清楚，數據明確。
`
  },
  business_reply: {
    goal: "品牌塑造",
    topic: "商務合作回信",
    userRole: "專案經理",
    audience: "潛在合作廠商",
    platform: "ChatGPT",
    tone: "專業且親切",
    constraint: "禮貌、具體回覆",
    reference: "合作條件、先前溝通紀錄",
    format: "簡短描述＋一句展望",
    prompt: `
請幫我生成一份商務合作回信，內容包含：
1. 針對對方的提案/合作需求，表達感謝
2. 明確回覆合作條件或回饋
3. 若有進一步問題或要求，條列具體說明
4. 結尾給對方一個親切、積極的展望句
語氣要專業且親切。
`
  },
  cover_letter: {
    goal: "學習成長",
    topic: "求職信（Cover Letter）",
    userRole: "求職者",
    audience: "人資、面試主管",
    platform: "ChatGPT",
    tone: "專業誠懇",
    constraint: "300字內、量身打造",
    reference: "職缺描述、自傳",
    format: "詳細描述",
    prompt: `
請根據以下條件，撰寫一份專業誠懇的求職信（Cover Letter）：
1. 開頭說明應徵動機與職缺關聯
2. 條列個人能力/經驗與職缺的連結
3. 強調自我優勢及對公司貢獻
4. 結尾表達期待面談與合作
內容精簡300字以內。
`
  },
  edm_email: {
    goal: "品牌塑造",
    topic: "Email 行銷 EDM 樣板",
    userRole: "行銷人員",
    audience: "目標客戶",
    platform: "ChatGPT",
    tone: "激勵、吸引人",
    constraint: "附 CTA（行動呼籲）",
    reference: "促銷活動資訊",
    format: "簡短描述＋一句展望",
    prompt: `
請產生一則具吸引力的Email行銷EDM內容，結構如下：
1. 開頭吸睛問候＋痛點描述
2. 推薦主打商品/活動亮點（條列）
3. 結尾附行動呼籲（CTA）
語氣激勵、可包含emoji。
`
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
    format: "條列式",
    prompt: `
請協助整理一份會議紀要重點，內容結構如下：
1. 會議時間/主題/參與人員簡述
2. 會議重點事項條列（不少於3點）
3. 待辦事項/後續追蹤
請以條列式清楚呈現，內容力求簡明。
`
  },
  lesson_plan: {
    goal: "學習成長",
    topic: "教學腳本",
    userRole: "老師",
    audience: "初學者",
    platform: "ChatGPT",
    tone: "啟發性",
    constraint: "逐步、淺顯易懂",
    reference: "",
    format: "腳本/多段",
    prompt: `
請根據下列主題，設計一份適合初學者的教學腳本，包含：
1. 教學目標/核心重點
2. 分段解說，每段以5-7句描述
3. 互動問題或小練習建議
語氣啟發，內容易懂、富有層次。
`
  },
  study_notes: {
    goal: "學習成長",
    topic: "學習筆記整理",
    userRole: "學生",
    audience: "自己、同學",
    platform: "ChatGPT",
    tone: "條理清楚",
    constraint: "條列、重點精簡",
    reference: "課堂內容",
    format: "條列式",
    prompt: `
請協助將課堂內容條列整理為學習重點筆記，結構如下：
1. 主題/章節說明（2-3句）
2. 條列最重要的5-8點重點
3. 若有關鍵例子或備註，額外說明
內容務求精簡、條理分明。
`
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
    format: "詳細描述",
    prompt: `
請根據以下資訊，撰寫一份300字以內的履歷自傳，內容包含：
1. 個人背景與主要學經歷
2. 專業技能/代表成就
3. 強調個人特質與優勢
4. 結尾一句自我期許或展望
語氣要專業、有條理。
`
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
    format: "簡短描述",
    prompt: `
請針對以下主題，發想3~5組具有創意、吸引力的文案短句，字數每句20字內。
請強調創意點或品牌差異，可包含emoji。
`
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
    format: "條列式",
    prompt: `
請根據產品特性，設計5組吸睛的廣告標題（每組10字以內），請凸顯誘因與差異化。
`
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
    format: "簡短描述＋一句展望",
    prompt: `
請產生一份溫馨的活動邀請文，內容包含：
1. 活動簡介與亮點
2. 邀請對象與參加方式
3. 結尾一句誠摯邀請或期待相見
語氣輕鬆且有親和力。
`
  },
  youtube_script: {
    goal: "激發創意",
    topic: "YouTube 影片腳本",
    userRole: "YouTuber",
    audience: "頻道粉絲",
    platform: "ChatGPT",
    tone: "輕鬆幽默",
    constraint: "分段、可含 emoji",
    reference: "主題大綱",
    format: "腳本/多段",
    prompt: `
根據以下主題及大綱，生成一支YouTube短片腳本，結構如下：
1. 開場歡迎語+吸引注意力（可加emoji）
2. 主題重點分段介紹（每段可有小標/幽默點綴）
3. 結尾call to action（訂閱/留言等）
語氣活潑，總長度建議300-500字。
`
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
    format: "簡短描述",
    prompt: `
針對下列主題，撰寫一篇創意社群貼文，內容包含：
1. 活潑有趣的主題描述
2. 至少兩組 hashtag
語氣輕鬆、鼓勵互動。
`
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
    format: "詳細描述",
    prompt: `
請為下列主題撰寫一段溫馨的電子報開頭文，內容包含：
1. 問候語及主題亮點
2. 喚起共鳴或期待
3. 結尾呼應品牌理念
語氣溫馨、充滿正能量。
`
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
    format: "條列式",
    prompt: `
請協助自動生成FAQ客服回覆內容，結構如下：
1. 條列顧客常見問題及精簡解答（不少於3題）
2. 若有後續服務/聯繫方式，附註於末段
語氣溫馨且友善。
`
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
    format: "簡短描述＋一句展望",
    prompt: `
請產生一篇產品開箱心得文，內容包含：
1. 簡述產品外觀/特色
2. 實際使用心得，條列2-3點優缺點
3. 結尾一句購買建議或展望
語氣誠實，適度展現品牌感。
`
  },
  product_faq: {
    goal: "效率工作",
    topic: "產品 FAQ 自動生成",
    userRole: "產品經理",
    audience: "顧客",
    platform: "ChatGPT",
    tone: "溫馨且解釋性強",
    constraint: "條列、每題簡潔明瞭",
    reference: "產品說明書、常見問題紀錄",
    format: "條列式",
    prompt: `
根據下列產品資訊，自動生成產品FAQ，結構如下：
1. 條列常見問題及解答（每題不超過40字）
2. 強調安全/保固等關鍵資訊
語氣溫馨、說明力強。
`
  },
  seo_title: {
    goal: "品牌塑造",
    topic: "SEO 文章標題與關鍵字",
    userRole: "網站小編",
    audience: "搜尋用戶",
    platform: "ChatGPT",
    tone: "專業",
    constraint: "中英文各五組",
    reference: "主要產品、目標市場",
    format: "條列式",
    prompt: `
請根據下列主題，設計SEO友善的文章標題與關鍵字組合，中英文各五組，格式如下：
1. 中文標題 + 關鍵字
2. 英文標題 + 關鍵字
內容要貼近搜尋需求。
`
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
    format: "條列式",
    prompt: `
請根據以下描述，生成適用於Midjourney的圖像指令，格式如下：
1. 中文描述
2. 英文對照（prompt）
3. 可加上風格、色彩等建議
內容條理分明、可直接複製使用。
`
  }
};
// ---------- templates (已優化個性化) -------------
const templates = {
  // ...（直接貼上我上一則的 templates 物件）...
  // ...（字數限制這裡省略，請完整貼上那份）
};
// -------------------------------------------------

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
      `【今日目標】${get('goal')}
【主題內容】${get('topic')}
【操作角色】${get('userRole')}
【目標受眾】${get('audience')}
【使用平台】${get('platform')}
【語氣風格】${get('tone')}
【限制條件】${get('constraint')}
${get('reference') ? '【引用資料】' + get('reference') : ''}
【輸出格式】${get('format')}

請根據以上資訊，結構化地為我生成高價值、高可讀性的 AI Prompt，分段落、條列、重點說明。
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
