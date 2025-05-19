// ==== Firebase & 基本功能 ====
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

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
const db = getFirestore(app);

// ==== 會員登入顯示切換 ====
const userDisplay = document.getElementById('user-display');
const loginSection = document.getElementById('login-section');
const mainApp = document.getElementById('main-app');

onAuthStateChanged(auth, async user => {
  if (user) {
    userDisplay.innerHTML = `已登入：${user.email} <button id="logoutBtn">登出</button>`;
    loginSection.style.display = 'none';
    mainApp.style.display = 'block';
    document.getElementById('logoutBtn').onclick = logout;
    await renderFavorites(); // 登入時自動渲染雲端收藏
  } else {
    userDisplay.innerHTML = '';
    loginSection.style.display = 'block';
    mainApp.style.display = 'none';
  }
});

// ==== 註冊 ====
document.getElementById('registerForm').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert('註冊成功！');
  } catch (error) {
    alert('註冊失敗：' + error.message);
  }
};

// ==== 登入 ====
document.getElementById('loginForm').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert('登入成功！');
  } catch (error) {
    alert('登入失敗：' + error.message);
  }
};

// ==== 登出 ====
function logout() {
  signOut(auth);
  alert('已登出');
}

// ==== Prompt 產生與本地渲染功能（略） ====
// ...（跟你之前的 Prompt 產生邏輯相同，只需將收藏同步到雲端即可）

// 範本清單
const templates = {
  creative_copy: { topic: "新產品上市", userRole: "行銷企劃", audience: "大眾消費者", platform: "ChatGPT", tone: "啟發性", constraint: "加入生活情境，100字內", format: "簡短描述" },
  learning_summary: { topic: "量子力學入門", userRole: "老師", audience: "高中生", platform: "ChatGPT", tone: "輕鬆", constraint: "重點條列、白話解釋", format: "詳細描述" },
  meeting_notes: { topic: "本週專案會議重點", userRole: "專案經理", audience: "團隊成員", platform: "ChatGPT", tone: "專業", constraint: "用條列整理，內容精簡", format: "腳本/多段" },
  brainstorm: { topic: "提升工作效率的方法", userRole: "管理者", audience: "上班族", platform: "ChatGPT", tone: "啟發性", constraint: "列舉5種不同觀點", format: "腳本/多段" },
  roleplay: { topic: "模擬面試對話", userRole: "人資主管", audience: "面試者與面試官", platform: "ChatGPT", tone: "專業", constraint: "每人各自發言", format: "腳本/多段" },
  midjourney: { topic: "日落時分的城市天際線", userRole: "設計師", audience: "攝影與設計愛好者", platform: "Midjourney", tone: "詩意", constraint: "柔和光影，夢幻氛圍", format: "簡短描述" },
  pro_writer: { topic: "人工智慧對社會的影響", userRole: "作家", audience: "大學生", platform: "ChatGPT", tone: "專業", constraint: "結構清楚，有觀點分析", format: "詳細描述" }
};

const templateSelect = document.getElementById("template-select");
const clearFormBtn = document.getElementById("clear-form");
const form = document.getElementById("prompt-form");
const outputSection = document.getElementById("output-section");
const outputField = document.getElementById("output");
const explanationField = document.getElementById("explanation");
const usageTipsField = document.getElementById("usage-tips");
const copyBtn = document.getElementById("copy-btn");
const saveBtn = document.getElementById("save-btn");
const toast = document.getElementById("toast");
const toastSaved = document.getElementById("toast-saved");
const toastDeleted = document.getElementById("toast-deleted");
const toastEdited = document.getElementById("toast-edited");
const toastExport = document.getElementById("toast-export");
const favoritesSection = document.getElementById("favorites-section");
const favoritesList = document.getElementById("favorites-list");
const exportBtn = document.getElementById("export-btn");

if (templateSelect) {
  templateSelect.addEventListener("change", function () {
    const val = templateSelect.value;
    if (templates[val]) {
      document.getElementById("topic").value = templates[val].topic;
      document.getElementById("userRole").value = templates[val].userRole;
      document.getElementById("audience").value = templates[val].audience;
      document.getElementById("platform").value = templates[val].platform;
      document.getElementById("tone").value = templates[val].tone;
      document.getElementById("constraint").value = templates[val].constraint;
      document.getElementById("format").value = templates[val].format;
    }
  });
}
if (clearFormBtn) {
  clearFormBtn.addEventListener("click", function () {
    form.reset();
    if (templateSelect) templateSelect.value = "";
    outputSection.style.display = "none";
    clearErrorTips();
  });
}

function clearErrorTips() {
  ['topic','userRole','audience','platform','tone','format'].forEach(function(id){
    document.getElementById("error-" + id).innerText = "";
  });
}

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // 取得欄位
    const topic = document.getElementById("topic").value.trim();
    const userRole = document.getElementById("userRole").value.trim();
    const audience = document.getElementById("audience").value.trim();
    const platform = document.getElementById("platform").value;
    const tone = document.getElementById("tone").value;
    const constraint = document.getElementById("constraint").value.trim();
    const format = document.getElementById("format").value;
    const group = document.getElementById("group").value.trim();

    // 檢查必填
    let hasError = false;
    clearErrorTips();
    if (!topic) { document.getElementById("error-topic").innerText = "此為必填"; hasError=true; }
    if (!userRole) { document.getElementById("error-userRole").innerText = "此為必填"; hasError=true; }
    if (!audience) { document.getElementById("error-audience").innerText = "此為必填"; hasError=true; }
    if (!platform) { document.getElementById("error-platform").innerText = "此為必填"; hasError=true; }
    if (!tone) { document.getElementById("error-tone").innerText = "此為必填"; hasError=true; }
    if (!format) { document.getElementById("error-format").innerText = "此為必填"; hasError=true; }
    if (hasError) { return; }

    let prompt = "";
    let explanation = "";
    let usageTips = "";

    if (platform === "ChatGPT") {
      prompt = `你是${userRole}，請以「${tone}」的語氣，針對「${audience}」這個受眾，為主題「${topic}」撰寫一段${format}。${constraint ? "要求：" + constraint + "。" : ""}`;
      explanation = `此 Prompt 適合用於 ChatGPT，快速產生文案、故事、總結、對話、腳本、分析等。`;
      usageTips = `<b>最佳用法：</b> 將本 Prompt 貼到 ChatGPT 或任一 AI 聊天工具，即可快速得到高品質回應。<br><b>延伸建議：</b> 可針對「語氣」、「格式」細調，嘗試多種風格/用途。`;
    } else if (platform === "Midjourney") {
      prompt = `${topic}, ${audience}, ${tone}, ${constraint ? constraint + ", " : ""}--v 6 --ar 4:5 --q 2`;
      explanation = `此 Prompt 適合在 Midjourney 生成創意圖片，風格強調${tone}。`;
      usageTips = `<b>最佳用法：</b> 請將 Prompt 貼到 Midjourney 對話框，隨時調整細節參數。<br><b>延伸建議：</b> 可更換主題/風格，嘗試不同構圖與氛圍。`;
    } else {
      prompt = `你是${userRole}，請根據主題「${topic}」，以「${tone}」的語氣，為「${audience}」設計一段${format}。${constraint ? "要求：" + constraint + "。" : ""}`;
      explanation = `此 Prompt 適用於多種 AI 文字/圖片生成平台，快速組成專業需求。`;
      usageTips = `<b>最佳用法：</b> 用於多數 AI 工具（如 Notion AI、Copy.ai、Bing、Claude 等）。<br><b>延伸建議：</b> 多測試不同條件組合，尋找最適合自己的產出。`;
    }

    prompt = beautifyPrompt(prompt);

    outputField.value = prompt;
    explanationField.innerHTML = explanation;
    usageTipsField.innerHTML = usageTips;
    outputField.setAttribute('data-group', group);
    outputSection.style.display = "block";
  });
}

// 複製功能 + Toast 提示
if (copyBtn) {
  copyBtn.addEventListener("click", function () {
    outputField.select();
    document.execCommand("copy");
    showToast(toast);
  });
}

// ==== 收藏（雲端）功能 ====

// 雲端儲存收藏
if (saveBtn) {
  saveBtn.addEventListener("click", async function () {
    if (!auth.currentUser) {
      alert('請先登入會員');
      return;
    }
    const promptText = outputField.value.trim();
    if (!promptText) return;
    const group = outputField.getAttribute('data-group') || "";
    const date = new Date().toLocaleString();
    try {
      await addDoc(collection(db, "favorites"), {
        uid: auth.currentUser.uid,
        text: promptText,
        group: group,
        date: date
      });
      showToast(toastSaved);
      await renderFavorites();
    } catch (e) {
      alert("雲端收藏失敗：" + e.message);
    }
  });
}

// 匯出收藏
if (exportBtn) {
  exportBtn.addEventListener("click", async function () {
    const favs = await getFavorites();
    if (!favs.length) return;
    let txt = favs.map(fav =>
      `[${fav.group ? fav.group : '未分組'}] ${fav.text.replace(/\n/g," ")}`
    ).join("\n\n");
    downloadFile(txt, "my_prompts.txt");
    showToast(toastExport);
  });
}

// Firestore 取得收藏
async function getFavorites() {
  if (!auth.currentUser) return [];
  const q = query(collection(db, "favorites"), where("uid", "==", auth.currentUser.uid));
  const snap = await getDocs(q);
  let arr = [];
  snap.forEach(doc => {
    arr.push({ ...doc.data(), id: doc.id });
  });
  return arr;
}

// Firestore 刪除收藏
async function deleteFavoriteCloud(id) {
  await deleteDoc(doc(db, "favorites", id));
  showToast(toastDeleted);
  await renderFavorites();
}

// Firestore 編輯收藏
async function editFavoriteCloud(id, newText) {
  await updateDoc(doc(db, "favorites", id), { text: newText });
  showToast(toastEdited);
  await renderFavorites();
}

// 分組渲染收藏
async function renderFavorites() {
  const favs = await getFavorites();
  favoritesList.innerHTML = "";
  if (!favs.length) {
    favoritesSection.style.display = "none";
    return;
  }
  favoritesSection.style.display = "block";
  // 按 group 分組
  const groupMap = {};
  favs.forEach((item) => {
    const g = item.group && item.group.trim() ? item.group.trim() : "未分組";
    if (!groupMap[g]) groupMap[g] = [];
    groupMap[g].push(item);
  });
  Object.keys(groupMap).forEach(groupName => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "group-block";
    const groupTitle = document.createElement("div");
    groupTitle.className = "group-title";
    groupTitle.textContent = groupName;
    groupDiv.appendChild(groupTitle);
    groupMap[groupName].forEach(item => {
      const div = document.createElement("div");
      div.className = "favorite-card";
      div.innerHTML = `
        <div class="favorite-content" id="fc-${item.id}">${item.text.replace(/\n/g,"<br>")}</div>
        <textarea class="favorite-edit-area" id="edit-${item.id}" style="display:none; width:100%;height:60px;">${item.text}</textarea>
        <div style="font-size:13px; color:#999; margin-bottom:7px;">${item.date}</div>
        <div class="favorite-btns">
          <button class="favorite-copy" data-id="${item.id}">複製</button>
          <button class="favorite-edit" data-id="${item.id}">編輯</button>
          <button class="favorite-save" data-id="${item.id}" style="display:none;">儲存</button>
          <button class="favorite-cancel" data-id="${item.id}" style="display:none;">取消</button>
          <button class="favorite-delete" data-id="${item.id}">刪除</button>
        </div>
      `;
      groupDiv.appendChild(div);
    });
    favoritesList.appendChild(groupDiv);
  });

  // 複製
  favoritesList.querySelectorAll('.favorite-copy').forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const fav = favs.find(x => x.id === id);
      if (fav) {
        navigator.clipboard.writeText(fav.text);
        showToast(toast);
      }
    });
  });
  // 刪除
  favoritesList.querySelectorAll('.favorite-delete').forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      deleteFavoriteCloud(id);
    });
  });
  // 編輯
  favoritesList.querySelectorAll('.favorite-edit').forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      document.getElementById("fc-" + id).style.display = "none";
      document.getElementById("edit-" + id).style.display = "";
      const p = this.parentElement;
      p.querySelector(".favorite-edit").style.display = "none";
      p.querySelector(".favorite-delete").style.display = "none";
      p.querySelector(".favorite-copy").style.display = "none";
      p.querySelector(".favorite-save").style.display = "";
      p.querySelector(".favorite-cancel").style.display = "";
    });
  });
  // 儲存
  favoritesList.querySelectorAll('.favorite-save').forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      const newText = document.getElementById("edit-" + id).value;
      editFavoriteCloud(id, newText);
    });
  });
  // 取消
  favoritesList.querySelectorAll('.favorite-cancel').forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      document.getElementById("fc-" + id).style.display = "";
      document.getElementById("edit-" + id).style.display = "none";
      const p = this.parentElement;
      p.querySelector(".favorite-edit").style.display = "";
      p.querySelector(".favorite-delete").style.display = "";
      p.querySelector(".favorite-copy").style.display = "";
      p.querySelector(".favorite-save").style.display = "none";
      p.querySelector(".favorite-cancel").style.display = "none";
    });
  });
}

function showToast(element) {
  element.style.display = "block";
  setTimeout(() => {
    element.style.display = "none";
  }, 1700);
}

// 下載檔案（匯出功能）
function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
  }, 1000);
}

function beautifyPrompt(str) {
  return str
    .replace("撰寫一段簡短描述", "撰寫一段精煉有力、吸引人的短句")
    .replace("撰寫一段詳細描述", "撰寫一段詳盡、有說服力並具邏輯性的內容")
    .replace("撰寫一段腳本/多段", "請產出完整腳本，包含條列指令、明確步驟、細節描述")
    .replace("請以「品牌感」的語氣", "請以品牌故事感的語調")
    .replace("專業", "專業且具邏輯性")
    .replace("啟發性", "啟發性、引導思考");
}
