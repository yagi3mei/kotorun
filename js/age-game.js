/* =========================================
   File: age-game.js
   Purpose: 年齢ゲームのプレイロジック
   Author: やぎさん
   Created: 2026-05-11
   Updated: 2026-05-22: LocalStorageベスト記録保存・結果モーダル拡張対応
   Updated: 2026-06-05: google analytics イベント送信追加

   Notes:
   - 1歳〜20歳の年齢読み学習ゲーム
   - 音声とひらがなを聞いて正しい年齢を選ぶ
   - familyゲームをベースに構成
========================================= */

import ageData from "../data/age/age-data.js";

// ストレージからスコアを保存・取得する関数
import {
    saveScore,
    getScore
} from "./storage.js";

/* =========================
   定数・変数
========================= */

const board =
    document.getElementById(
        "age-board"
    );

const questionDisplay =
    document.getElementById(
        "question-display"
    );

const timerDisplay =
    document.getElementById(
        "timer-display"
    );

const remainingDisplay =
    document.getElementById(
        "remaining-display"
    );

const missDisplay =
    document.getElementById(
        "miss-display"
    );

const resultModal =
    document.getElementById(
        "result-modal"
    );

const gameTypeLabel =
    document.getElementById(
        "game-type-label"
    );

const dateTime =
    document.getElementById(
        "date-time"
    );

const finalTime =
    document.getElementById(
        "final-time"
    );

const missResult =
    document.getElementById(
        "miss-result"
    );

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

let used = [];

let currentQuestion = null;

let missCount = 0;

let startTime;

let timerInterval;

// 回答ロックフラグ（連続クリック防止用）
let isAnswerLocked = false;

/* =========================
   初期カード生成
========================= */
function renderCards() {

    ageData.forEach(item => {

        const card =
            document.createElement("div");

        card.className = "age-card";

        card.dataset.id = item.id;

        card.innerHTML = `
            <img
                src="images/age/${item.img}"
                alt="${item.reading}">

            <div class="age-label">
                ${item.age}
            </div>
        `;
        
        card.addEventListener(
            "click",
            () => checkAnswer(item, card)
        );

        board.appendChild(card);

    });

}


/* =========================
   問題生成
========================= */
function loadQuestion() {

    const remain =
        ageData.filter(
            x => !used.includes(x.id)
        );

    remainingDisplay.textContent =
        "のこり：" + remain.length;


    /* 全問終了 */
    if (remain.length === 0) {

        showResult();

        return;
    }


    currentQuestion =
        remain[
            Math.floor(
                Math.random() * remain.length
            )
        ];


    used.push(
        currentQuestion.id
    );


    /* 問題表示 */
    questionDisplay.textContent =
        currentQuestion.reading;


    /* 音声再生 */
    playAudio();

}


/* =========================
   音声再生
========================= */
function playAudio() {

    speechSynthesis.cancel();

    const utter =
        new SpeechSynthesisUtterance(
            currentQuestion.speech
        );

    utter.lang = "ja-JP";

    utter.rate = 0.8;

    speechSynthesis.speak(utter);

}


document
    .getElementById("sound-btn")
    .addEventListener(
        "click",
        playAudio
    );


/* =========================
   回答判定
========================= */
function checkAnswer(selected, card) {

    /* 連打防止 */
    if (isAnswerLocked) {
        return;
    }

    isAnswerLocked = true;

    /* 正解 */
    if (selected.id === currentQuestion.id) {

        speechSynthesis.cancel();

        /* 正解音 */
        const correctSound =
            document.getElementById(
                "sound-correct"
            );

        correctSound.volume = 0.4;

        correctSound.currentTime = 0;

        correctSound.play();

        setTimeout(() => {

            loadQuestion();

            isAnswerLocked = false;

        }, 300);

    } else {

        /* ミス音 */
        const wrongSound =
            document.getElementById(
                "sound-wrong"
            );

        wrongSound.volume = 0.3;

        wrongSound.currentTime = 0;

        wrongSound.play();

        /* シェイク */
        card.style.animation =
            "shake 0.2s";

        setTimeout(() => {

            card.style.animation = "";

            isAnswerLocked = false;

        }, 200);

        /* ミス数 */
        missCount++;

        missDisplay.textContent =
            "ミス：" + missCount;

    }

}

/* =========================
   結果表示
========================= */
function showResult() {

    clearInterval(timerInterval);

    const now =
        new Date();

    const dateStr =
        now.toLocaleString();

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
            "age",
            "age_game"
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
        "age",
        "age_game",
        {
            time: Number(time),
            miss: missCount,
            date: dateStr
        }
    );

    // Google Analytics イベント送信
    if (typeof gtag === "function")
    {
        gtag(
            "event",
            "game_clear",
            {
                game: "age",
                mode: "age_game",
                miss: result.miss,
                time: result.time
            }
        );
}


    const best =
        getScore(
            "age",
            "age_game"
        );


    /* =====================
       今回結果
    ===================== */
    gameTypeLabel.textContent =
        "【ねんれいゲーム】";

    dateTime.textContent =
        dateStr;

    missResult.textContent =
        `ミス：${missCount}回`;

    finalTime.textContent =
        `タイム：${time}秒`;


    /* =====================
       ベスト表示
    ===================== */
    if (isBest) {

        bestMessage.textContent =
            "🎉 ベストきろく　こうしん！";

        bestDate.textContent = "";
        bestMiss.textContent = "";
        bestTime.textContent = "";

    } else {

        bestMessage.textContent = "";

        bestDate.textContent =
            `いつ：${best.date}`;

        bestMiss.textContent =
            `ミス：${best.miss}回`;

        bestTime.textContent =
            `タイム：${best.time}秒`;

    }


    resultModal.classList.remove(
        "hidden"
    );
}

/* =========================
   ゲーム開始
========================= */
function startGame() {

    missCount = 0;

    used = [];


    missDisplay.textContent =
        "ミス：0";


    startTime =
        performance.now();


    clearInterval(
        timerInterval
    );


    timerInterval =
        setInterval(() => {

            timerDisplay.textContent =
                (
                    (performance.now() - startTime)
                    / 1000
                ).toFixed(2);

        }, 50);


    loadQuestion();

}


/* =========================
   リスタート
========================= */
window.restartGame = function() {

    resultModal.classList.add(
        "hidden"
    );

    startGame();

};


/* =========================
   メニューへ戻る
========================= */
window.goMenu = function() {

    location.href =
        "kazu-jikan-index.html";

};


/* =========================
   初期化
========================= */

renderCards();

startGame();