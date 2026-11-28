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

import {
    showResultModal,
    hideResultModal
} from "./result-modal.js";

// ストレージからスコアを保存・取得する関数
import {saveScore, getScore} from "./storage.js";

// 共通タイマー
import {
    startTimer,
    stopTimer
} from "./timer.js";

// 共通ステータス表示
import {
    updateRemainingDisplay,
    updateMissDisplay
} from "./status.js";

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


let used = [];

let currentQuestion = null;

let missCount = 0;

let wrongQuestions = [];

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

    const remainingCount = remain.length;
    updateRemainingDisplay(remainingDisplay, remainingCount);

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

        if (!wrongQuestions.includes(currentQuestion.reading)) {
            wrongQuestions.push(currentQuestion.reading);
        }

        /* ミス数 */
        missCount++;

        updateMissDisplay(missDisplay, missCount);

    }

}

/* =========================
   結果表示
========================= */
function showResult() {

    const time = stopTimer();

    const now =
        new Date();

    const dateStr =
        now.toLocaleString();

    /* =====================
       スコア保存・ベスト更新判定
    ===================== */
    const result = {
        time: time,
        miss: missCount,
        date: dateStr
    };

    const updated = saveScore(
        "age",
        "age_game",
        result
    );


    const best =
        getScore(
            "age",
            "age_game"
        );


    /* =====================
    共通の結果モーダル表示
    ===================== */
    const resultData = {
        gameName: "なんさい",
        gameType: "なんさい",
        category: "age",
        gameKey: "age_game",
        date: dateStr,
        time: Number(time),
        missCount: missCount,
        bestUpdated: updated,
        bestRecord: best
            ? {
                date: best.date,
                miss: best.miss,
                time: best.time
            }
            : null,
        wrongQuestions: wrongQuestions.map(
            question => ({
                question: question
            })
        )
    };

    showResultModal(resultData, {
        onRestart: () => {
            window.restartGame();
        },
        onMenu: () => {
            window.goMenu();
        }
    });

}

/* =========================
   ゲーム開始
========================= */
function startGame() {

    missCount = 0;

    used = [];

    wrongQuestions = [];


    updateMissDisplay(missDisplay, missCount);


    startTimer(timerDisplay);


    loadQuestion();

}


/* =========================
   リスタート
========================= */
window.restartGame = function() {

    hideResultModal();

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