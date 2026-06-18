/* =========================================
   File: calendar-game.js
   Purpose : 日づけゲーム制御
   Author  : やぎさん
   Created : 2026-05-09
   Updated: 2026-05-22: LocalStorageベスト記録保存・結果モーダル拡張対応

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
   storage.js
========================= */
import {
    saveScore,
    getScore
} from "./storage.js";

/* =========================
   storage key
========================= */
function getStorageKey() {
    return "calendar";
}

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
// 回答ロックフラグ（多重クリック防止）
let isAnswerLocked = false;

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

    isAnswerLocked = false;
}

/* =========================
   正解判定
========================= */
function checkAnswer(selectedDay){

     /* 連打防止 */
    if (isAnswerLocked) {
        return;
    }

    isAnswerLocked = true;

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

        const wrongSound =
            document.getElementById(
                "sound-wrong"
            );

        wrongSound.currentTime = 0;

        wrongSound.play();

        wrongSound.onended = () => {

            isAnswerLocked = false;

        };
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
        (
            (performance.now() - startTime)
            / 1000
        ).toFixed(2);


    /* =====================
       ベスト判定
    ===================== */
    const oldBest =
        getScore(
            "calendar",
            getStorageKey()
        );

    const isBest =
        !oldBest
        || missCount < oldBest.miss
        || (
            missCount === oldBest.miss
            && Number(time) < oldBest.time
        );


    /* =====================
       スコア保存
    ===================== */
    saveScore(
        "calendar",
        getStorageKey(),
        {
            time: Number(time),
            miss: missCount,
            date: dateStr
        }
    );

    const best =
        getScore(
            "calendar",
            getStorageKey()
        );


    /* =====================
       今回結果
    ===================== */
    document.getElementById("game-type-label")
        .textContent =
        "【日づけ（カレンダー）】";

    document.getElementById("date-time")
        .textContent =
        dateStr;

    document.getElementById("final-time")
        .textContent =
        `タイム：${time}秒`;

    document.getElementById("miss-result")
        .textContent =
        `ミス：${missCount}回`;


    /* =====================
       ベスト表示
    ===================== */
    const bestMessage =
        document.getElementById(
            "best-message"
        );

    const bestDate =
        document.getElementById(
            "best-date"
        );

    const bestTime =
        document.getElementById(
            "best-time"
        );

    const bestMiss =
        document.getElementById(
            "best-miss"
        );


    if (isBest) {

        bestMessage.textContent =
            "🎉 ベストきろく　こうしん！";

        bestDate.textContent = "";
        bestTime.textContent = "";
        bestMiss.textContent = "";

    } else {

        bestMessage.textContent = "";

        bestDate.textContent =
            `いつ：${best.date}`;

        bestTime.textContent =
            `タイム：${best.time}秒`;

        bestMiss.textContent =
            `ミス：${best.miss}回`;
    }


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
    location.href = "hizuke-index.html";
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