/* =========================================
   File: calendar-game.js
   Purpose : 日づけゲーム制御
   Author  : やぎさん
   Created : 2026-05-09

   Notes:
   - 日付カード生成
   - 問題出題
   - 正解判定
   - 音声再生
========================================= */

/* =========================
   日付データ
========================= */
import calendarData from "../data/calendar/calendar-days.js";

/* =========================
   HTML取得
========================= */
const calendarGrid = document.getElementById("calendar-grid");
const questionDisplay = document.getElementById("question-display");
const remainingDisplay = document.getElementById("remaining-display");
const missDisplay = document.getElementById("miss-display");

const startBtn = document.getElementById("start-btn");
const soundBtn = document.getElementById("sound-btn");

/* =========================
   ゲーム管理変数
========================= */
let calendarDays = [];
let questions = [];
let currentQuestion = null;

let remaining = 0;
let missCount = 0;
// タイマー関連
let startTime = 0;
let timerInterval;

/* =========================
   カード生成
========================= */
function createCalendarCards(){

    calendarGrid.innerHTML = "";

    calendarData.forEach(item => {

        const card = document.createElement("div");

        card.classList.add("day-card");

        card.textContent = item.day;

        card.dataset.day = item.day;

        card.addEventListener("click", () => {
            checkAnswer(item.day);
        });

        calendarGrid.appendChild(card);
    });
}

/* =========================
   ゲーム開始
========================= */
function startGame(){

    // はじめるボタンを隠す
    startBtn.style.display = "none";

    // 問題コピー
    questions = [...calendarData];

    // シャッフル
    questions.sort(() => Math.random() - 0.5);

    remaining = questions.length;
    missCount = 0;

    updateDisplays();

    // タイマー開始
    startTime = performance.now();

    timerInterval = setInterval(() => {

        const t =
            (performance.now() - startTime) / 1000;

        document.getElementById("timer-display")
            .textContent = t.toFixed(2);

    }, 50);

    nextQuestion();
}

/* =========================
   次の問題
========================= */
function nextQuestion(){

    // 終了判定
    if(questions.length === 0){
        endGame();
        return;
    }

    currentQuestion = questions.pop();

    questionDisplay.textContent = currentQuestion.text;

    speakQuestion();
}

/* =========================
   正解判定
========================= */
function checkAnswer(selectedDay){

    // 正解
    if(selectedDay === currentQuestion.day){

        // 読み上げ停止
        speechSynthesis.cancel();

        remaining--;

        updateDisplays();

        const correctSound =
            document.getElementById("sound-correct");

        correctSound.currentTime = 0;

        correctSound.volume = 0.4;
        correctSound.play();

        // 少し待って次問題
        setTimeout(() => { nextQuestion(); }, 300);

    }else{

        missCount++;

        updateDisplays();

        // 間違い音
        document.getElementById("sound-wrong").play();
    }
}

/* =========================
   表示更新
========================= */
function updateDisplays(){

    remainingDisplay.textContent = "のこり：" + remaining;

    missDisplay.textContent = "ミス：" + missCount;
}

/* =========================
   音声読み上げ
========================= */
function speakQuestion(){

    const utterance = new SpeechSynthesisUtterance(
        currentQuestion.speech
    );

    utterance.lang = "ja-JP";

    speechSynthesis.speak(utterance);
}

/* =========================
   ゲーム終了
========================= */
function endGame(){

    // タイマー停止
    clearInterval(timerInterval);

    // 音声停止
    speechSynthesis.cancel();

    // 現在日時
    const now = new Date();

    const dateStr = now.toLocaleString();

    // タイム計算
    const time =
        ((performance.now() - startTime) / 1000)
        .toFixed(2);

    // モーダルへ反映
    document.getElementById("date-time")
        .textContent = dateStr;

    document.getElementById("game-type-label")
        .textContent = "日づけ（カレンダー）";

    document.getElementById("final-time")
        .textContent = time + " 秒";

    document.getElementById("miss-result")
        .textContent = "ミス：" + missCount + " 回";

    // モーダル表示
    document.getElementById("result-modal")
        .classList.remove("hidden");
}

/* =========================
   リスタート
========================= */
function restartGame(){
    location.reload();
}

/* =========================
   メニューへ戻る
========================= */
function goMenu(){
    location.href = "iroiro-index.html";
}

/* =========================
   イベント設定
========================= */
startBtn.addEventListener("click", startGame);

soundBtn.addEventListener("click", speakQuestion);

/* =========================
   初期化
========================= */
createCalendarCards();

// 初期表示
document.getElementById("remaining-display")
    .textContent = "のこり：-";

document.getElementById("miss-display")
    .textContent = "ミス：-";

// html onclick から呼べるようにする
window.goMenu = goMenu;
window.restartGame = restartGame;