// ...前略(Firebase, Profile, Onboarding, UI相關同前)...

// ==== 十個完整自動填入的快速範本 ====
const templates = {
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

// ...其餘 script.js 內容維持不變...
