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

  // <<==== 請將「const templates = { ... }」放在這一行下面 ====>>
const templates = {
  project_vendor_mail: {
    customPrompt: `請協助我為{{audience}}設計一封具高度專業感的邀約信，主題「{{topic}}」，將於{{platform}}平台發送。請依以下結構撰寫：
1. 【情境與需求分析】說明此次邀約的背景、行業趨勢、對合作方的肯定，結合{{goal}}說明合作必要性。
2. 【邀約信內容產出】分段撰寫邀約信，包括：
   - 開頭自我介紹與信賴建立（可引用{{reference}}）。
   - 說明合作目標、預期效益與合作亮點。
   - 條列本次合作重點（如時程、分工、資源、{{constraint}}）。
   - 舉例過往合作經驗提升說服力。
   - 結尾以誠懇邀約語，附上聯絡資訊。
3. 【應用與延伸建議】說明此邀約信如何作為品牌形象、商業合作推進或提升合作意願的利器，並標明適用場合（如正式商業提案、學校對企業、初次接觸信件等）。
全篇須以{{tone}}呈現，邏輯清楚，格式為{{format}}，內容須具高度說服力和親和力。
`,
    goal: "爭取企業進行合作課程或專案",
    topic: "邀約廠商參與線上數位轉型課程",
    userRole: "專案經理",
    audience: "企業教育窗口",
    platform: "Email",
    tone: "誠懇、專業、合作導向",
    constraint: "合作條款須明確，邀約語要親切",
    reference: "過去合作成功案例、公司簡介",
    format: "正式商務信件，分段條列"
  },
  project_word_report: {
    customPrompt: `請以{{tone}}語氣，為{{audience}}撰寫「{{topic}}」完整專案企劃書，並於{{platform}}使用。請分段呈現以下內容：
1. 【專案情境與挑戰說明】分析市場、公司或社會的現實挑戰，明確指出本次專案推動的根本動機及{{goal}}，結合{{reference}}補充。
2. 【企劃內容深度產出】依照下列細項逐段撰寫，每段需含邏輯結構與案例／數據：
   - 案由說明
   - 現況分析
   - 痛點/問題條列（每點有對組織/市場的影響）
   - 規劃方向（核心策略與理由）
   - 行動方案（分項詳列流程、時程、分工、資源投入）
   - 預期效益與KPI（定量、定性皆可）
   - 後續時程與檢核方式
   - 特殊限制或風險評估（如{{constraint}})
3. 【應用建議與延伸】總結企劃書適用的審查/提案/內部溝通場合，並提出如何進行後續優化或資料補充建議。
每段請獨立明確標題、層次分明，格式採用{{format}}，確保閱讀流暢，便於決策審查。
`,
    goal: "取得決策主管支持專案",
    topic: "數位轉型人才培育專案企劃",
    userRole: "企劃人員",
    audience: "部門主管與團隊成員",
    platform: "Word、Google Docs",
    tone: "邏輯嚴謹、精準、重點清楚",
    constraint: "內容需含時程表與KPI指標",
    reference: "去年部門年度報告、數位轉型產業趨勢",
    format: "條列分段，附表格"
  },
  project_ppt: {
    customPrompt: `請協助設計一份{{audience}}用於{{platform}}的專案簡報（{{topic}}），並深度細化每個分頁內容，結構如下：
1. 【簡報情境定位】說明此次簡報的使用場景（如提案、審查、內部簡報），強調{{goal}}。
2. 【分頁內容深度引導】每一分頁請明確分段：
   - 專案背景與目標
   - 現況分析（含市場/內部/競品分析）
   - 策略與執行方案（每一策略細分動機、執行方式、困難與資源）
   - 預期效益與成果指標（KPI、亮點）
   - 時程與分工（表格形式佳）
   - Q&A或結語（重點重申、期望互動）
   - （如有特殊{{constraint}}請明確說明如何調整內容或表現）
3. 【應用與延伸】說明簡報如何用於不同場合（內外部簡報、培訓、審查），提供優化視覺或分工建議。
所有內容須以{{tone}}語氣，條理分明，格式為{{format}}，能直接複製分頁簡報內容。
`,
    goal: "成功讓主管核准專案提案",
    topic: "新產品線開發簡報",
    userRole: "產品經理",
    audience: "產品部主管與決策委員會",
    platform: "PowerPoint、Google Slides",
    tone: "專業、有說服力、簡明有力",
    constraint: "每分頁主題明確、少於50字、適合口頭簡報",
    reference: "前一季市場研究簡報",
    format: "分頁條列，含流程圖"
  },
  project_name: {
    customPrompt: `請協助設計3~5組適合{{audience}}的專案名稱（{{topic}}），須兼顧創意、專業與傳播力，結構如下：
1. 【命名情境說明】描述專案主題、核心願景、所欲傳達價值及命名對象（如目標市場、團隊）。
2. 【名稱提案內容】每一組名稱請包含：
   - 名稱本體（中英文皆可）
   - 命名邏輯與亮點（如結合品牌、行業趨勢、專案目標）
   - 適用場合／易記性／故事性說明
   - 如有{{constraint}}請依規範產生
   - 若可納入{{reference}}作為靈感更佳
3. 【應用建議】說明每個名稱適合用於哪些場合（提案、品牌宣傳、內部討論），建議如何加深記憶點或推廣效果。
全篇分條明確，以{{tone}}風格、{{format}}格式，便於評估與決策。
`,
    goal: "命名新一代智慧辦公方案",
    topic: "Smart Office Solution 專案命名",
    userRole: "產品行銷經理",
    audience: "潛在企業客戶、市場大眾",
    platform: "內部會議、對外簡報",
    tone: "創意、專業、易記",
    constraint: "中英文皆可、不可超過6字、須有未來感",
    reference: "國際知名科技專案命名案例",
    format: "名稱+命名說明條列"
  },
  meeting_name: {
    customPrompt: `請根據{{topic}}及{{audience}}，設計3~5個會議名稱，讓名稱能清楚反映主題、氣氛與目標。結構如下：
1. 【情境定位】說明會議目標（如協作、分享、決策等）及與會成員背景。
2. 【名稱內容提案】每個名稱需包含：
   - 名稱本體（可中英文並列）
   - 命名背後的邏輯與靈感（結合公司文化、會議特色）
   - 適用場合（如正式、輕鬆、內外部會議）
   - 若有{{constraint}}請納入調整
   - 可結合{{reference}}（如品牌Slogan、歷屆名稱）
3. 【延伸應用】簡述如何在宣傳、紀錄、報表等場景使用該名稱增強團隊凝聚力。
內容需分段明確，語氣{{tone}}，格式以{{format}}輸出，方便一眼比較評選。
`,
    goal: "推動部門共識與協作",
    topic: "年度策略規劃會議命名",
    userRole: "部門助理",
    audience: "跨部門主管、專案成員",
    platform: "Teams、Google Calendar",
    tone: "專業、活潑、親和",
    constraint: "中文、英文各一組，需有團隊感",
    reference: "公司Slogan、前兩年會議名稱",
    format: "名稱＋命名邏輯說明"
  },
  satisfaction_survey: {
    customPrompt: `請為{{audience}}設計一份「{{topic}}」滿意度問卷，需符合以下結構與邏輯：
1. 【問卷目的與情境引導】說明本次問卷發放背景、調查目標與後續應用情境，強調收集意見將如何改善服務或產品。
2. 【問卷題目設計內容】共8~10題，分為：
   - 整體滿意度評分
   - 流程體驗、溝通品質、服務內容、問題處理等分項（每類2題）
   - 回購或推薦意願（1題）
   - 開放建議（1題）
   - 如有特殊{{constraint}}（如必填題、量表、開放題混合）請標示並設計
   - 可引用{{reference}}（如過去問卷優秀題目）
3. 【應用與填寫建議】說明問卷如何協助優化客戶體驗、提升產品服務，並提醒受眾填寫時注意事項。
題目分段清楚、結構明確，以{{tone}}語氣、{{format}}格式完整條列，適合各種問卷平台。
`,
    goal: "評估顧客對線上客服中心的滿意度",
    topic: "客服服務滿意度問卷設計",
    userRole: "服務體驗設計師",
    audience: "客服使用者",
    platform: "Google Forms",
    tone: "中立、簡明、友善",
    constraint: "需混合量表、開放題",
    reference: "去年問卷、業界最佳實務問卷",
    format: "分段條列"
  },
  exchange_survey: {
    customPrompt: `請設計一份專為{{audience}}（如團隊成員、合作夥伴）進行經驗交流的問卷，主題為「{{topic}}」，總題數5~7題，並依以下結構規劃：
1. 【問卷設計情境說明】簡要說明此次經驗交流問卷的目的（如提升團隊反思、激勵創新）。
2. 【題目內容產出】涵蓋
   - 最有收穫的經驗（開放題）
   - 遇到的困難與解決過程
   - 合作或活動中印象深刻的片段
   - 團隊優勢、個人學習心得
   - 未來優化建議、合作期望
   - 對主辦單位或組織的總體評價
   - 額外開放建議
   - 每題如有{{constraint}}請標明（如字數、回答方式）
   - 參考{{reference}}補充深度
3. 【應用建議】說明問卷如何促進團隊成長、合作優化，並建議何時適合發送。
整份問卷需條列分段，語氣{{tone}}，以{{format}}完整結構呈現，方便實務運用。
`,
    goal: "回饋團隊跨部門協作經驗",
    topic: "專案協作經驗交流問卷",
    userRole: "專案協調人",
    audience: "專案小組成員",
    platform: "Google表單",
    tone: "中性、鼓勵反思",
    constraint: "每題不少於50字",
    reference: "前次交流活動紀錄",
    format: "條列"
  },
  b2b_intro_mail: {
    customPrompt: `請以{{tone}}語氣，為{{audience}}撰寫一封B2B業務開發郵件，主題為「{{topic}}」，用途為{{goal}}。信件內容結構如下：
1. 【自我介紹與品牌亮點】簡要介紹{{userRole}}和公司背景，可引用{{reference}}。
2. 【聯絡動機與合作前景】說明本次主動聯繫原因，明確描述希望探討的合作方向或共創價值。
3. 【產品/服務優勢條列】請以條列方式突出產品核心賣點或過往成功案例，凸顯合作可能帶來的效益。
4. 【邀約/後續安排】提出具體會議邀約或溝通方式，列出可供選擇的聯絡時段或平台（如{{platform}}）。
5. 【結語與聯絡資訊】專業結尾，重申合作期待並留下聯絡方式。
內容請依{{constraint}}調整篇幅，總結以{{format}}方式輸出，適合正式對外郵件。
`,
    goal: "建立合作關係、拓展業務版圖",
    topic: "智能客服系統導入合作提案",
    userRole: "業務開發專員",
    audience: "企業IT主管",
    platform: "Email、LinkedIn",
    tone: "專業、積極、正向",
    constraint: "須明確列舉3大產品優勢",
    reference: "客戶成功案例、官方產品頁面",
    format: "條列分段信件格式"
  },
  annual_report: {
    customPrompt: `請協助為{{audience}}設計一份{{tone}}的年度業績簡報，主題為「{{topic}}」，使用平台為{{platform}}，內容包含：
1. 【年度銷售數據總覽】分頁圖表呈現年度營收、成長率、目標達成狀況。
2. 【主要成就與亮點】條列重大專案、創新舉措、客戶成長等。
3. 【重要事件回顧】列出年度關鍵事件（如合作案、里程碑、獲獎），說明對業績的正面影響。
4. 【未達成指標與因應措施】誠實說明尚未達標項目及背後原因，提出改進方案。
5. 【明年展望/行動計畫】簡述來年的核心目標與重點策略，條列新年度預計推進方向。
6. 【結語】收尾強調團隊努力與成長動力。
內容可根據{{constraint}}（如條列/分頁長度），引用{{reference}}資料佐證。請以{{format}}格式整理，條理分明。
`,
    goal: "年度回顧、營運檢討、策略規劃",
    topic: "2024 年度品牌行銷部業績報告",
    userRole: "行銷主管",
    audience: "高階經理人、跨部門團隊",
    platform: "PowerPoint",
    tone: "正向、務實、重點明確",
    constraint: "每分頁不超過3重點",
    reference: "ERP數據、內部KPI報表",
    format: "分頁條列"
  },
  business_reply: {
    customPrompt: `請協助我以{{tone}}撰寫一封專業親切的商務合作回信，針對{{audience}}就「{{topic}}」的詢問/邀約進行回覆，並依以下結構：
1. 【情境說明】開頭簡述對合作機會的感謝與肯定，說明本次溝通的重點。
2. 【內容主體產出】
   - 條列針對合作條件的明確回應，逐項針對每一合作要素或問題提出具體看法或解法。
   - 若有條件、限制或需調整之處（{{constraint}}）請明確說明，必要時引用{{reference}}。
   - 提出後續流程建議（如會議安排、合約流程、資料補充）。
3. 【應用與結尾建議】說明本回信如何促進合作推進，並在結尾邀請對方隨時回覆、持續聯繫。
信件格式{{format}}，結構清楚，易於商務往來。
`,
    goal: "回覆合作邀約並釐清細節",
    topic: "共同推廣線上活動回信",
    userRole: "行銷窗口",
    audience: "異業合作窗口",
    platform: "Email",
    tone: "親切、清楚、積極",
    constraint: "要明確分段回應3個合作要點",
    reference: "先前溝通記錄",
    format: "條列分段信件"
  },
  cover_letter: {
    customPrompt: `請依{{reference}}及{{audience}}，為{{userRole}}產生一封專業且具個人特色的求職信（{{topic}}），分段結構如下：
1. 【情境與動機分析】開場描述個人對該產業/公司的熱情及申請動機，結合個人故事或觸發點（如{{goal}}）。
2. 【能力與經歷產出】
   - 條列三項與該職位最切合的能力與過往成就，每項都簡述背後故事或實際數據。
   - 補充個人軟實力、團隊合作、專案經驗等優勢。
3. 【職涯展望與結尾】說明職涯規劃與未來如何為團隊帶來價值，結尾誠懇邀請面試機會並附聯絡方式。
4. 【應用場合建議】說明此信可用於正式投遞、校園徵才、內部推薦等情境，並依{{constraint}}調整篇幅。
內容以{{format}}分段、{{tone}}語氣，邏輯清晰，感情真摯。
`,
    goal: "獲得產品行銷專員面試機會",
    topic: "申請品牌行銷企劃職位",
    userRole: "新鮮人",
    audience: "人資主管",
    platform: "Email、104人力銀行",
    tone: "積極、誠懇、具熱忱",
    constraint: "總長不超過400字",
    reference: "公司徵才說明、履歷內容",
    format: "分段信件格式"
  },
  edm_email: {
    customPrompt: `請根據{{goal}}與{{audience}}，以{{tone}}語氣設計一封{{topic}}行銷EDM，結構如下：
1. 【EDM目標與場景分析】說明本次EDM推廣的目標（如新品上市、活動促銷）及受眾特性。
2. 【內容產出分段】
   - 吸睛主旨與開場問候（可呼應{{reference}}品牌標語）
   - 條列活動亮點、產品優勢或獨家優惠
   - 強調行動呼籲（如點擊購買、參加活動等）
   - 時間限制、適用條件（依{{constraint}}特別標示）
   - 結尾誠摯感謝與聯絡資訊
3. 【應用延伸建議】說明此EDM可用於哪些行銷管道，提供分眾優化或A/B測試思路。
全篇分段明確，格式為{{format}}，內容具高度轉換力。
`,
    goal: "促銷新品、增加網站流量",
    topic: "夏季新品優惠活動",
    userRole: "行銷企劃",
    audience: "電子報訂戶",
    platform: "MailChimp、電子報系統",
    tone: "活潑、熱情、動感",
    constraint: "須含專屬折扣碼、有效期限",
    reference: "品牌Slogan、前期活動EDM",
    format: "條列分段"
  },
  meeting_summary: {
    customPrompt: `請協助我為{{audience}}於{{platform}}整理一份「{{topic}}」會議紀要，結構如下：
1. 【會議背景與目的】開頭交代本次會議召開背景、討論目標（{{goal}}），說明重要性。
2. 【紀要內容產出】
   - 與會人員及分工說明
   - 條列討論議題與重點發言，每個議題補充關鍵數據或補充說明（可依據{{reference}})
   - 決議事項與執行責任人（明確標示期限）
   - 待追蹤事項與下次會議預告
   - 如有{{constraint}}請在相關議題標記
3. 【應用建議】說明本紀要適用於內部追蹤、主管報告或跨部門溝通，提醒會議紀要撰寫人應注意的細節。
內容以{{tone}}語氣、{{format}}條理分明，方便快速閱讀與行動。
`,
    goal: "落實跨部門專案追蹤與分工",
    topic: "月度專案進度檢討會議紀要",
    userRole: "專案助理",
    audience: "跨部門成員與主管",
    platform: "Teams、Google文件",
    tone: "精簡、重點化、明確",
    constraint: "每個決議須指定負責人與期限",
    reference: "前期會議紀要",
    format: "條列分段"
  },
  lesson_plan: {
    customPrompt: `請為{{audience}}設計一份結構完整、易懂且具啟發性的教學腳本，主題為「{{topic}}」，由{{userRole}}主講，適用於{{platform}}平台。請依以下結構撰寫：
1. 【教學目標】明確列出本次教學欲達成的知識或技能目標。
2. 【課程大綱】條列主要章節與教學順序。
3. 【每步驟教學內容】每個章節細分步驟、知識點、重點提醒。
4. 【練習題與互動設計】設計一至兩個練習或互動活動，鼓勵學員參與（依{{constraint}}調整數量與型態）。
5. 【延伸補充與參考】補充延伸知識點或推薦參考資料（如{{reference}}）。
6. 【結語】總結本次教學重點，並給予學習建議。
腳本語氣請符合{{tone}}風格，請以{{format}}分段清楚呈現，適合實際教學現場使用。
`,
    goal: "讓學員掌握Python基礎語法",
    topic: "Python 初學者教學腳本",
    userRole: "講師",
    audience: "大學生、初學者",
    platform: "現場課程、Google Meet",
    tone: "親切、易懂、循序漸進",
    constraint: "每個章節都需設一個小練習",
    reference: "課本範例、官方教學資源",
    format: "分段條列"
  },
  study_notes: {
    customPrompt: `請以{{tone}}語氣協助我針對{{topic}}進行學習筆記整理，對象為{{audience}}，適用於{{platform}}。內容請結構如下：
1. 【主題摘要】簡要說明主題內容與學習目的。
2. 【重點條列】每個核心概念、理論、公式或事例，以條列式分項整理，根據{{reference}}補充細節。
3. 【圖表/整理】如有，請適度用表格或簡易圖示強化記憶。
4. 【小結與延伸思考】對每段內容給出簡短小結，並提出可延伸閱讀/思考方向。
5. 【個人心得】結尾請附上自己的學習反思或應用建議。
6. 【限制條件】如有{{constraint}}需遵守，請說明並調整結構。
請以{{format}}分段清楚輸出，內容要重點明確、易於複習。
`,
    goal: "完整消化微積分期中考範圍",
    topic: "微積分-極限、導數與應用",
    userRole: "大一理工學生",
    audience: "自己／同學",
    platform: "Notion、OneNote",
    tone: "邏輯清楚、重點明確",
    constraint: "每章重點須有一例題解析",
    reference: "指定教科書、學長筆記",
    format: "分段條列"
  },
  resume_bio: {
    customPrompt: `請根據{{reference}}，以{{tone}}語氣協助{{userRole}}產生一份針對{{audience}}的履歷自傳，主題為「{{topic}}」，用於{{platform}}。內容請分段敘述：
1. 【個人簡介】基本資料、學歷、專業背景。
2. 【主要能力與成就】分條列出3~5項核心技能或工作成就，每項可附案例、數據或專案經歷。
3. 【職涯規劃與發展目標】簡述個人對未來工作的期待、學習方向及能帶來的價值。
4. 【個人特質/團隊精神】描述軟實力、溝通協作經驗、適合組織文化的優勢。
5. 【結語】強調誠意、希望獲得進一步面試或聯絡機會。
整體篇幅請依{{constraint}}調整，請用{{format}}條列，內容充實有層次。
`,
    goal: "順利錄取數據分析師實習",
    topic: "數據分析師履歷自傳",
    userRole: "應屆畢業生",
    audience: "人資主管",
    platform: "104、CakeResume",
    tone: "邏輯明確、自信、誠懇",
    constraint: "總長800字以內",
    reference: "官方職缺說明、面試經驗分享",
    format: "條列段落"
  },
  creative_copy: {
    customPrompt: `請針對{{audience}}，以{{tone}}語氣，為主題「{{topic}}」設計1-3則極具創意、引人注目、易於記憶的短文案，內容適合在{{platform}}平台上進行社群宣傳或品牌推廣。請依下列結構撰寫：
1. 【創意激發引導】在構思文案時，請思考該主題能觸發受眾共鳴的情境、痛點、幽默感或生活連結，結合品牌個性與最新流行趨勢，必要時可利用押韻、雙關語、擬人、時事梗等手法。
2. 【文案提案（1-3則）】每則文案請：
   - 字數控制於{{constraint}}（如20字內）。
   - 內容須具備畫面感或能激發想像力。
   - 可配合品牌標語、Slogan或指定{{reference}}進行優化。
   - 每則下方簡述創意發想邏輯或預期帶給受眾的感覺。
3. 【適用建議】針對每則文案，說明適合應用於哪些場合（如貼文主視覺、廣告標題、限時動態等）。
所有文案建議以{{format}}條列分段輸出，內容可依{{goal}}進行細節調整，並確保風格貼近{{audience}}的喜好與平台特性。
`,
    goal: "品牌新品上市搶眼曝光",
    topic: "清新果香無酒精氣泡飲",
    userRole: "社群小編",
    audience: "20-35歲都市年輕女性",
    platform: "Instagram、Facebook",
    tone: "活潑、俏皮、清新",
    constraint: "每則15字以內",
    reference: "品牌Slogan、競品文案",
    format: "條列"
  },
  ad_headline: {
    customPrompt: `請以{{tone}}語氣，為{{audience}}針對{{topic}}激發5組廣告標題，每則控制於{{constraint}}（如10字內），可嘗試中英文、押韻、雙關語或動詞開頭。每則下方可附一句創作思路或設計亮點說明。標題風格需明確適合{{platform}}及指定受眾，參考資料如{{reference}}可輔助靈感，輸出格式為{{format}}條列。
`,
    goal: "網路點擊率提升、品牌辨識度加強",
    topic: "新一代AI智慧音箱",
    userRole: "廣告投手",
    audience: "數位原生世代",
    platform: "Google、FB 廣告",
    tone: "科技感、動感",
    constraint: "每組10字內",
    reference: "上一代商品標題",
    format: "條列"
  },
  event_invite: {
    customPrompt: `請以{{tone}}語氣，為{{audience}}撰寫一則活動邀請文，主題為「{{topic}}」，內容結構如下：
1. 【活動主題/亮點開場】吸引人的開頭介紹活動性質與核心賣點。
2. 【活動資訊】明確交代時間、地點、參加方式（如需報名請特別註明）。
3. 【參加誘因】條列參與後可獲得的經驗、禮物或價值。
4. 【展望與誠摯邀請】以溫馨或勵志結語邀請參與。
如需符合{{constraint}}（如字數、格式），請調整內容，並可結合{{reference}}提供的活動背景。請用{{format}}輸出，適用於{{platform}}公告或社群。
`,
    goal: "提高現場參加率",
    topic: "永續綠生活體驗日",
    userRole: "活動企劃",
    audience: "親子家庭、綠生活愛好者",
    platform: "LINE官方帳號、社群貼文",
    tone: "熱情、溫馨、鼓勵參與",
    constraint: "需註明報名網址、含3個亮點",
    reference: "去年的活動花絮",
    format: "段落條列"
  },
  youtube_script: {
    customPrompt: `請以{{tone}}語氣，為{{platform}}頻道的{{audience}}，主題「{{topic}}」撰寫一份完整YouTube影片腳本。腳本結構如下：
1. 【片頭開場】吸睛開場白或小劇場（可加入emoji/梗），說明本集主題。
2. 【主題介紹】分段介紹主題核心內容，逐步拆解每個重點，插入1-2個問題或互動橋段。
3. 【案例/實作演練】舉例解釋或實際操作（如有），每步驟可用條列明細。
4. 【觀眾互動/Call to Action】引導觀眾留言、訂閱、分享，設計有趣的小互動。
5. 【結語與預告】簡要總結重點，預告下一集主題，並鼓勵持續關注。
若有{{constraint}}、{{reference}}指定內容，請一併納入腳本，格式以{{format}}分段清楚呈現，方便拍攝使用。
`,
    goal: "吸引訂閱與互動",
    topic: "一週五天簡單健康便當",
    userRole: "健康料理Youtuber",
    audience: "職場新鮮人、外食族",
    platform: "YouTube",
    tone: "溫暖、互動感強",
    constraint: "每段話30秒內",
    reference: "本月熱門便當食譜",
    format: "腳本分段"
  },
  social_post: {
    customPrompt: `請根據{{goal}}與{{topic}}，以{{tone}}語氣為{{audience}}設計一則社群貼文，適用於{{platform}}。內容須結合品牌個性或時事梗，建議結構如下：
1. 【貼文主題/開場】一句吸睛開頭，點明主題。
2. 【主體內容】分段描述活動、產品、理念或趣味故事，鼓勵粉絲留言互動。
3. 【行動呼籲/Hashtag】條列2-3組呼應主題的hashtag或參與方式（依{{constraint}}規範）。
4. 【附註或補充】如有{{reference}}請補充相關連結或資訊。
整體內容以{{format}}分段，親切且具互動感。
`,
    goal: "提升貼文互動率、品牌曝光",
    topic: "品牌環保購物袋上市",
    userRole: "品牌社群經營",
    audience: "年輕綠色消費者",
    platform: "Instagram、Facebook",
    tone: "活潑、有梗",
    constraint: "須含2個環保主題hashtag",
    reference: "聯名藝人介紹影片",
    format: "段落+Hashtag"
  },
  newsletter: {
    customPrompt: `請撰寫一段電子報開頭文，主題為「{{topic}}」，語氣{{tone}}，受眾為{{audience}}，適用於{{platform}}平台。內容請依以下結構：
1. 【本期主題簡介】說明本期重點內容或主題由來。
2. 【連結讀者/品牌精神】拉近與訂閱者距離，傳遞品牌理念或近期亮點。
3. 【閱讀動機/引導】鼓勵讀者繼續往下閱讀，或參與互動（如留言/問卷）。
可根據{{constraint}}（如字數或段落數）、{{reference}}（如品牌Slogan）調整。請以{{format}}分段清楚輸出。
`,
    goal: "促使讀者完整閱讀電子報",
    topic: "夏季節能家電特輯",
    userRole: "電子報小編",
    audience: "家庭用戶、老客戶",
    platform: "電子報",
    tone: "親切、有溫度、生活感",
    constraint: "段落不超過100字",
    reference: "品牌故事、專業部落客推薦",
    format: "分段"
  },
  faq_support: {
    customPrompt: `請為{{platform}}的{{audience}}設計一組FAQ自動回覆。內容結構如下：
1. 【常見問題列表】條列5-7題與{{topic}}相關的用戶提問，問題需貼近實際情境。
2. 【精準解答】針對每題給出明確、親切的解答，如有{{reference}}資料請引用補充。
3. 【延伸資訊/聯絡】如遇特殊問題請指引用戶聯繫方式或附上相關連結。
所有問答內容請以{{tone}}語氣，根據{{constraint}}調整簡潔或詳細程度，輸出格式為{{format}}。
`,
    goal: "減少人工客服負擔",
    topic: "線上訂單操作疑問",
    userRole: "客服系統管理員",
    audience: "網購消費者",
    platform: "官方網站、LINE",
    tone: "簡潔、親切、直接",
    constraint: "每題回答不超過80字",
    reference: "客服問答資料庫",
    format: "Q&A條列"
  },
  product_review: {
    customPrompt: `請協助以{{tone}}語氣，為{{audience}}撰寫一篇{{topic}}產品開箱心得，結構如下：
1. 【開箱經過】描述收到/拆箱過程，對產品第一印象。
2. 【外觀與設計細節】細述產品外觀、包裝、設計亮點。
3. 【實際體驗/使用方式】分段說明實測、功能試用、過程心得。
4. 【優缺點分析】條列明確列出優點與建議改進之處。
5. 【總結與推薦】綜合評價、建議適合族群，結尾給一句展望或推薦理由。
如有{{constraint}}（如字數、必含比較）或需引用{{reference}}資料，請補充於相關段落。全篇以{{format}}分段輸出，可直接用於{{platform}}或社群分享。
`,
    goal: "增加商品信任感與銷量",
    topic: "無線降噪耳機開箱體驗",
    userRole: "科技開箱YouTuber",
    audience: "音樂愛好者、3C迷",
    platform: "YouTube、Mobile01",
    tone: "活潑、專業、誠實",
    constraint: "需含一項與競品比較",
    reference: "產品官方規格、其他開箱影片",
    format: "段落分明"
  },
  product_faq: {
    customPrompt: `請根據{{reference}}（如產品說明書、常見問題紀錄），以{{tone}}語氣協助為{{audience}}自動生成5-7題{{topic}}FAQ。內容結構如下：
1. 【問題設計】每題聚焦於產品規格、使用方法、保固、維修、購買、常見操作疑問等（依{{constraint}}）。
2. 【清楚解答】針對每個問題給出簡明、直接的答案，必要時分段說明。
3. 【延伸指引/客服資訊】如問題較複雜請引導用戶查閱說明書或聯繫客服。
FAQ需以{{format}}條列，重點清晰，便於{{platform}}平台或產品頁面直接使用。
`,
    goal: "協助顧客自助解決問題",
    topic: "智慧型手環常見問題",
    userRole: "產品經理",
    audience: "消費者",
    platform: "產品官網",
    tone: "清楚、親切、易懂",
    constraint: "每題答案50字內",
    reference: "產品使用手冊",
    format: "Q&A條列"
  },
  seo_title: {
    customPrompt: `請以{{tone}}語氣，為{{platform}}上的{{audience}}針對{{topic}}產生SEO文章標題與關鍵字，內容分為：
1. 【中文標題及關鍵字】條列5組具搜尋力的中文標題，每組配2-3個熱門關鍵字。
2. 【英文標題及關鍵字】條列5組英文標題，對應2-3個英文熱門關鍵字。
3. 【設計邏輯與說明】每組可簡述設計重點，說明為何適合目標受眾。
可根據{{constraint}}（如產業/區域/用字）與{{reference}}（如主要產品、目標市場）進行補充，結果以{{format}}格式輸出，利於行銷優化。
`,
    goal: "提升網站流量與搜尋排名",
    topic: "居家防潮收納技巧",
    userRole: "SEO內容編輯",
    audience: "網路搜尋者",
    platform: "品牌官網部落格",
    tone: "實用、具專業信任感",
    constraint: "中英文標題各5組",
    reference: "Google Trends、競品網站",
    format: "條列"
  },
  midjourney_art: {
    customPrompt: `請以{{tone}}語氣，根據{{topic}}，為{{audience}}設計適用於{{platform}}的Midjourney圖像生成Prompt，內容如下：
1. 【圖像主題/構圖說明】條列2-3組中英文圖像描述，清楚表達主體、構圖、風格、色調與氛圍。
2. 【細節補充】每組Prompt可針對構圖比例、光影、鏡頭感等補充描述。
3. 【創意延伸】鼓勵結合最新AI風格或特殊藝術表現，並說明設計亮點。
如有{{constraint}}（如比例、特效）或{{reference}}（如範例連結）請適度融入。全篇以{{format}}分段，便於直接複製至Midjourney命令列。
`,
    goal: "產生品牌形象概念圖",
    topic: "極簡主義風格辦公室",
    userRole: "設計師",
    audience: "品牌行銷團隊",
    platform: "Midjourney v6",
    tone: "精準、有創意、細緻",
    constraint: "長寬比例16:9，需有自然光",
    reference: "品牌官網形象照、IG熱門風格",
    format: "英文分段Prompt"
  }
}


  // ---------- 取代所有變數 ----------
  function generatePrompt(tpl, values) {
    let output = tpl;
    Object.keys(values).forEach(k => {
      output = output.replaceAll(`{{${k}}}`, values[k] || "");
    });
    return output;
  }

  function setFormEnabled(enabled) {
    document.querySelectorAll('#prompt-form input, #prompt-form select, #prompt-form textarea, #prompt-form button[type="submit"]')
      .forEach(e => {
        if (e.id !== "template-select" && e.id !== "clear-form")
          e.disabled = !enabled;
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
    const fields = ['goal','topic','userRole','audience','platform','tone','constraint','reference','format'];
    fields.forEach(f => {
      document.getElementById(f).value = templates[val][f] || "";
    });
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
    const fields = ['goal','topic','userRole','audience','platform','tone','constraint','reference','format'];
    const val = document.getElementById('template-select').value;
    const tpl = templates[val];

    let output = "";
    if (tpl && tpl.customPrompt) {
      let values = {};
      fields.forEach(f => values[f] = get(f));
      output = generatePrompt(tpl.customPrompt, values);
    } else {
      output =
        `請以「${get('tone')}」的語氣，針對「${get('audience')}」，在「${get('platform')}」上，以「${get('format')}」方式，撰寫關於「${get('topic')}」的內容。
身份角色為「${get('userRole')}」，目標是「${get('goal')}」。
${get('constraint') ? "請注意：" + get('constraint') : ""}
${get('reference') ? "可參考資料：" + get('reference') : ""}`;
    }
    document.getElementById('output').value = output;
    document.getElementById('output-section').style.display = '';
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

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => {
      t.classList.remove('show');
    }, 1600);
  }

  // Google 登入/登出
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

  loginBtn.onclick = () => { 
    loginModal.classList.remove('hidden');
  };
  document.getElementById('modal-close').onclick = () => {
    loginModal.classList.add('hidden');
  };

  document.getElementById('google-login').onclick = async function () {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      loginModal.classList.add('hidden');
    } catch (e) {
      alert('Google 登入失敗：' + e.message);
    }
  };
  logoutBtn.onclick = () => signOut(auth);

  // 收藏、留言、匯出
  const db = () => dbInstance;
  const favoritesSection = document.getElementById('favorites-section');
  const favoritesList = document.getElementById('favorites-list');

  document.getElementById('save-btn').onclick = async function () {
    if (!auth.currentUser) {
      showToast('請先登入才能收藏');
      loginModal.classList.remove('hidden');
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

  // 登入/登出後即時同步顯示「我的最愛」
  onAuthStateChanged(auth, user => {
    currentUser = user;
    updateUserUI(user);
    loadFavorites();
  });

  // 即時必填欄位驗證/紅框提示
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
