document.addEventListener("DOMContentLoaded", () => {
    // 範本清單同前
    const templates = {
      creative_copy: { topic: "新產品上市", audience: "大眾消費者", platform: "ChatGPT", tone: "啟發性", constraint: "加入生活情境，100字內", format: "簡短描述" },
      learning_summary: { topic: "量子力學入門", audience: "高中生", platform: "ChatGPT", tone: "輕鬆", constraint: "重點條列、白話解釋", format: "詳細描述" },
      meeting_notes: { topic: "本週專案會議重點", audience: "專案團隊成員", platform: "ChatGPT", tone: "專業", constraint: "用條列整理，內容精簡", format: "腳本/多段" },
      brainstorm: { topic: "提升工作效率的方法", audience: "上班族", platform: "ChatGPT", tone: "啟發性", constraint: "列舉5種不同觀點", format: "腳本/多段" },
      roleplay: { topic: "模擬面試對話", audience: "面試者與面試官", platform: "ChatGPT", tone: "專業", constraint: "每人各自發言", format: "腳本/多段" },
      midjourney: { topic: "日落時分的城市天際線", audience: "攝影與設計愛好者", platform: "Midjourney", tone: "詩意", constraint: "柔和光影，夢幻氛圍", format: "簡短描述" },
      pro_writer: { topic: "人工智慧對社會的影響", audience: "大學生", platform: "ChatGPT", tone: "專業", constraint: "結構清楚，有觀點分析", format: "詳細描述" }
    };
  
    // DOM 取得
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
      ['topic','audience','platform','tone','format'].forEach(function(id){
        document.getElementById("error-" + id).innerText = "";
      });
    }
  
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
  
        // 取得欄位
        const topic = document.getElementById("topic").value.trim();
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
        if (!audience) { document.getElementById("error-audience").innerText = "此為必填"; hasError=true; }
        if (!platform) { document.getElementById("error-platform").innerText = "此為必填"; hasError=true; }
        if (!tone) { document.getElementById("error-tone").innerText = "此為必填"; hasError=true; }
        if (!format) { document.getElementById("error-format").innerText = "此為必填"; hasError=true; }
        if (hasError) { return; }
  
        let prompt = "";
        let explanation = "";
        let usageTips = "";
  
        if (platform === "ChatGPT") {
          prompt = `請以「${tone}」的語氣，針對「${audience}」這個受眾，為主題「${topic}」撰寫一段${format}。${constraint ? "要求：" + constraint + "。" : ""}`;
          explanation = `此 Prompt 適合用於 ChatGPT，快速產生文案、故事、總結、對話、腳本、分析等。`;
          usageTips = `<b>最佳用法：</b> 將本 Prompt 貼到 ChatGPT 或任一 AI 聊天工具，即可快速得到高品質回應。<br><b>延伸建議：</b> 可針對「語氣」、「格式」細調，嘗試多種風格/用途。`;
        } else if (platform === "Midjourney") {
          prompt = `${topic}, ${audience}, ${tone}, ${constraint ? constraint + ", " : ""}--v 6 --ar 4:5 --q 2`;
          explanation = `此 Prompt 適合在 Midjourney 生成創意圖片，風格強調${tone}。`;
          usageTips = `<b>最佳用法：</b> 請將 Prompt 貼到 Midjourney 對話框，隨時調整細節參數。<br><b>延伸建議：</b> 可更換主題/風格，嘗試不同構圖與氛圍。`;
        } else {
          prompt = `請根據主題「${topic}」，以「${tone}」的語氣，為「${audience}」設計一段${format}。${constraint ? "要求：" + constraint + "。" : ""}`;
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
  
    // 收藏功能
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        const promptText = outputField.value.trim();
        if (!promptText) return;
        const group = outputField.getAttribute('data-group') || "";
        addFavorite(promptText, group);
        showToast(toastSaved);
        renderFavorites();
      });
    }
  
    // 匯出功能
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        const favs = getFavorites();
        if (favs.length === 0) return;
        let txt = favs.map(fav =>
          `[${fav.group ? fav.group : '未分組'}] ${fav.text.replace(/\n/g," ")}`
        ).join("\n\n");
        downloadFile(txt, "my_prompts.txt");
        showToast(toastExport);
      });
    }
  
    // 收藏資料處理
    function getFavorites() {
      return JSON.parse(localStorage.getItem('my_prompts') || '[]');
    }
    function setFavorites(list) {
      localStorage.setItem('my_prompts', JSON.stringify(list));
    }
    function addFavorite(promptText, group) {
      const favs = getFavorites();
      favs.unshift({ text: promptText, group: group, date: new Date().toLocaleString() });
      setFavorites(favs);
    }
    function deleteFavorite(idx) {
      const favs = getFavorites();
      favs.splice(idx, 1);
      setFavorites(favs);
      showToast(toastDeleted);
      renderFavorites();
    }
    function editFavorite(idx, newText) {
      const favs = getFavorites();
      favs[idx].text = newText;
      setFavorites(favs);
      showToast(toastEdited);
      renderFavorites();
    }
  
    // 分組渲染收藏
    function renderFavorites() {
      const favs = getFavorites();
      favoritesList.innerHTML = "";
      if (favs.length === 0) {
        favoritesSection.style.display = "none";
        return;
      }
      favoritesSection.style.display = "block";
      // 按 group 分組
      const groupMap = {};
      favs.forEach((item, idx) => {
        const g = item.group && item.group.trim() ? item.group.trim() : "未分組";
        if (!groupMap[g]) groupMap[g] = [];
        groupMap[g].push({ ...item, idx });
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
            <div class="favorite-content" id="fc-${item.idx}">${item.text.replace(/\n/g,"<br>")}</div>
            <textarea class="favorite-edit-area" id="edit-${item.idx}" style="display:none; width:100%;height:60px;">${item.text}</textarea>
            <div style="font-size:13px; color:#999; margin-bottom:7px;">${item.date}</div>
            <div class="favorite-btns">
              <button class="favorite-copy" data-idx="${item.idx}">複製</button>
              <button class="favorite-edit" data-idx="${item.idx}">編輯</button>
              <button class="favorite-save" data-idx="${item.idx}" style="display:none;">儲存</button>
              <button class="favorite-cancel" data-idx="${item.idx}" style="display:none;">取消</button>
              <button class="favorite-delete" data-idx="${item.idx}">刪除</button>
            </div>
          `;
          groupDiv.appendChild(div);
        });
        favoritesList.appendChild(groupDiv);
      });
  
      // 複製
      favoritesList.querySelectorAll('.favorite-copy').forEach(btn => {
        btn.addEventListener("click", function () {
          const idx = parseInt(this.getAttribute("data-idx"));
          const favs = getFavorites();
          if (favs[idx]) {
            navigator.clipboard.writeText(favs[idx].text);
            showToast(toast);
          }
        });
      });
      // 刪除
      favoritesList.querySelectorAll('.favorite-delete').forEach(btn => {
        btn.addEventListener("click", function () {
          const idx = parseInt(this.getAttribute("data-idx"));
          deleteFavorite(idx);
        });
      });
      // 編輯
      favoritesList.querySelectorAll('.favorite-edit').forEach(btn => {
        btn.addEventListener("click", function () {
          const idx = this.getAttribute("data-idx");
          document.getElementById("fc-" + idx).style.display = "none";
          document.getElementById("edit-" + idx).style.display = "";
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
          const idx = this.getAttribute("data-idx");
          const newText = document.getElementById("edit-" + idx).value;
          editFavorite(idx, newText);
        });
      });
      // 取消
      favoritesList.querySelectorAll('.favorite-cancel').forEach(btn => {
        btn.addEventListener("click", function () {
          const idx = this.getAttribute("data-idx");
          document.getElementById("fc-" + idx).style.display = "";
          document.getElementById("edit-" + idx).style.display = "none";
          const p = this.parentElement;
          p.querySelector(".favorite-edit").style.display = "";
          p.querySelector(".favorite-delete").style.display = "";
          p.querySelector(".favorite-copy").style.display = "";
          p.querySelector(".favorite-save").style.display = "none";
          p.querySelector(".favorite-cancel").style.display = "none";
        });
      });
    }
  
    // 初始載入收藏
    renderFavorites();
  
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
  });
  
  function beautifyPrompt(str) {
    return str
      .replace("撰寫一段簡短描述", "撰寫一段精煉有力、吸引人的短句")
      .replace("撰寫一段詳細描述", "撰寫一段詳盡、有說服力並具邏輯性的內容")
      .replace("撰寫一段腳本/多段", "請產出完整腳本，包含條列指令、明確步驟、細節描述")
      .replace("請以「品牌感」的語氣", "請以品牌故事感的語調")
      .replace("專業", "專業且具邏輯性")
      .replace("啟發性", "啟發性、引導思考");
  }
  