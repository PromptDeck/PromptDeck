// 預設三種範本資料，可依需求再擴充
const templates = {
  creative_copy: {
    topic: "新產品上市活動亮點",
    audience: "大眾消費者",
    platform: "ChatGPT",
    tone: "啟發性",
    constraint: "條列五點, 100字內",
    format: "簡短描述",
    group: "行銷"
  },
  lesson_plan: {
    topic: "五分鐘自學Python",
    audience: "國中小學生",
    platform: "ChatGPT",
    tone: "輕鬆",
    constraint: "200字內, 要有引導性",
    format: "腳本/多段",
    group: "學習"
  },
  social_post: {
    topic: "母親節祝福短句",
    audience: "Facebook社群粉絲",
    platform: "ChatGPT",
    tone: "溫馨",
    constraint: "20字以內, 要有情感共鳴",
    format: "簡短描述",
    group: "社群"
  }
};

// 快速範本套用
document.getElementById('template-select').addEventListener('change', function() {
  const t = templates[this.value];
  if (t) {
    document.getElementById('topic').value = t.topic;
    document.getElementById('audience').value = t.audience;
    document.getElementById('platform').value = t.platform;
    document.getElementById('tone').value = t.tone;
    document.getElementById('constraint').value = t.constraint;
    document.getElementById('format').value = t.format;
    document.getElementById('group').value = t.group;
  }
});

// 清空表單
document.getElementById('clear-form').addEventListener('click', function() {
  document.getElementById('prompt-form').reset();
  document.getElementById('template-select').value = '';
});

// 表單送出產生 prompt
document.getElementById('prompt-form').addEventListener('submit', function(e) {
  e.preventDefault();
  // 驗證必填
  let err = false;
  ['topic','audience','platform','tone','format'].forEach(id=>{
    if(!document.getElementById(id).value.trim()) err=true;
  });
  if (err) { alert('請填寫所有必填欄位'); return; }

  // 取得值
  const topic = document.getElementById('topic').value.trim();
  const audience = document.getElementById('audience').value.trim();
  const platform = document.getElementById('platform').value;
  const tone = document.getElementById('tone').value;
  const constraint = document.getElementById('constraint').value.trim();
  const format = document.getElementById('format').value;
  // 組合 prompt
  let prompt = `請以${tone}風格，為「${audience}」設計一份主題為「${topic}」的${format}`;
  if (constraint) prompt += `（${constraint}）`;
  prompt += `。\n（適用於 ${platform}）`;

  // 彈窗顯示（你可改為頁內輸出）
  alert('推薦專業 Prompt：\n\n' + prompt);
});
