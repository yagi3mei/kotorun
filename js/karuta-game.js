// =========================================
//      File: karuta-game.js
//      Purpose: かるたゲームのプレイロジック（問題生成・判定・結果表示）
//      Author: やぎさん
//      Created: 2026-04-09
//      Updated: 2026-04-30: CSSファイル分割に伴う読み込み構造の変更
//
//      Notes:
//      - かるたゲームの共通JavaScriptファイル
//      - karuta-list.htmlからURLパラメータ（type, kana）を受け取りゲーム内容を切り替える
//      - 動的importを使用してデータファイル（../data/${type}_${kana}.js）を読み込む
//      - ゲームのロジック（問題選択、入力判定、タイマー、ミスカウントなど）を実装
// ========================================= 

const params = new URLSearchParams(window.location.search);
const type = params.get("type") || "hira";
const group = params.get("group") || "seion";
const kana = params.get("kana") || "a";
const kanaLabel = params.get("label") || kana;

const module = await import(`../data/kana/${type}/${group}/${type}_${kana}.js`);
const data = module.default;

const timerDisplay = document.getElementById("timer-display");
const missDisplay = document.getElementById("miss-display");


/* =========================
    画像フォルダ定数
========================= */

const IMAGE_DIR_MAP = {
  hira: {
    seion: "images/hiragana-seion/",
    dakuon: "images/hiragana-dakuon/",
    youon: "images/hiragana-youon/"
  },

  kata: {
    seion: "images/katakana-seion/"
  }
};

/* type + group に応じて自動切替 */
const IMAGE_DIR = IMAGE_DIR_MAP[type]?.[group] || "images/hiragana-seion/";

const typeDisplay =
  type === "hira" ? "ひらがな" : "カタカナ";

const groupDisplayMap = {
  seion: "せいおん",
  dakuon: "だくおん",
  youon: "ようおん"
};

const groupDisplay = groupDisplayMap[group] || "";

/* DOMキャッシュ */
const romajiDisplay = document.getElementById("romaji-display");
const cardsDiv = document.getElementById("cards");
const remainingDisplay = document.getElementById("remaining-display");
const resultTextEl = document.getElementById("result-text");
const resultModal = document.getElementById("result-modal");


/* 状態管理（問題数・ミス数・使用済み問題・誤答問題）を配列・変数で管理 */
let questionCount = 0;
let missCount = 0;
let startTime = performance.now();
let timerInterval;
let correctAnswer = null;
let wrongAnswers = [];
let usedQuestions = [];


/* 初期描画 */
remainingDisplay.textContent = "のこり：" + data.length;
missDisplay.textContent = "ミス：0";

// 配列をランダムに並び替える（簡易シャッフル）
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}


/* =====================
問題生成（メイン処理）
- 未出題の問題からランダム選択
- カード生成
- 音声再生
===================== */
function loadQuestion() {

  const remaining = data.filter(
    item => !usedQuestions.includes(item.id)
  );


  if (questionCount === 0) {

    startTime = performance.now();

    timerInterval = setInterval(() => {

      const t = (performance.now() - startTime) / 1000;

      timerDisplay.textContent = t.toFixed(2);

    }, 50);
  }

  remainingDisplay.textContent = "のこり：" + remaining.length;


  if (remaining.length === 0) {
    showResult();
    return;
  }


  correctAnswer =
    remaining[Math.floor(Math.random() * remaining.length)];

  usedQuestions.push(correctAnswer.id);


  romajiDisplay.textContent = correctAnswer.romaji;


  /* カード生成 */
  const selected = shuffle([...data]);

  cardsDiv.innerHTML = "";

  selected.forEach(item => {

    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");


    /* =========================
        画像パスを定数化
    ========================= */
    img.src = IMAGE_DIR + item.img;


    const label = document.createElement("div");
    label.className = "card-label";
    label.textContent = item.word;

    card.appendChild(img);
    card.appendChild(label);

    card.onclick = () => checkAnswer(item, card);

    cardsDiv.appendChild(card);

  });


  setTimeout(() => {
    playAudio();
  }, 500);

}



/* 音声 */
window.playAudio = function () {

  const utter =
    new SpeechSynthesisUtterance(correctAnswer.sentence);

  utter.lang = "ja-JP";

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);

};

document
.getElementById("sound-btn")
.addEventListener("click", playAudio);



/* =====================
回答判定
- 正解：次の問題へ
- 不正解：ミス加算＋演出
===================== */
function checkAnswer(selected, card) {

  if (selected.id === correctAnswer.id) {

    speechSynthesis.cancel();

    const sound = new Audio("sounds/correct.mp3");
    sound.volume = 0.4;
    sound.play();

    questionCount++;

    setTimeout(() => {
      loadQuestion();
    }, 500);

  } else {

    const sound = new Audio("sounds/wrong.mp3");
    sound.volume = 0.4;
    sound.play();

    missCount++;

    missDisplay.textContent =
      "ミス：" + missCount;


    if (!wrongAnswers.includes(correctAnswer.id)) {
      wrongAnswers.push(correctAnswer.id);
    }

    card.style.animation = "shake 0.3s";

    setTimeout(() => {
      card.style.animation = "";
    }, 300);

  }

}



/* =====================
結果表示
- タイム・ミス数・学習単語一覧を表示
- 誤答単語には★を付与
===================== */
function showResult() {

  clearInterval(timerInterval);

  const endTime = performance.now();

  const time =
    ((endTime - startTime) / 1000).toFixed(2);

  const now = new Date();

  const dateStr = now.toLocaleString();

  let wordList = "";

  data.forEach(item => {

    const isWrong =
      wrongAnswers.includes(item.id);

    const mark = isWrong ? "★" : "　";

    wordList +=
      `${mark} ${item.word}（${item.lesson}課）<br>`;

  });


  const resultText = `
    実施日時：${dateStr}<br><br>
    【${typeDisplay}　${kanaLabel}】<br>
    時間：${time}秒<br>
    ミス★：${missCount}回<br><br>
    ＜今回の単語＞<br>
    ${wordList}
  `;

  resultTextEl.innerHTML = resultText;

  resultModal.classList.remove("hidden");

}



/* 再スタート */
window.restartGame = function () {

  questionCount = 0;
  missCount = 0;

  startTime = Date.now();

  usedQuestions = [];
  wrongAnswers = [];

  missDisplay.textContent = "ミス：0";

  remainingDisplay.textContent =
    "のこり：" + data.length;

  resultModal.classList.add("hidden");

  loadQuestion();

};



/* 戻る */
window.goBack = function () {
  history.back();
};



/* 初期実行 */
loadQuestion();