/* =========================================
   File: age-game.js
   Purpose: 年齢ゲームのプレイロジック
   Author: やぎさん
   Created: 2026-05-11

   Notes:
   - 1歳〜20歳の年齢読み学習ゲーム
   - 音声とひらがなを聞いて正しい年齢を選ぶ
   - familyゲームをベースに構成
========================================= */

import ageData from "../data/age/age-data.js";


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


let used = [];

let currentQuestion = null;

let missCount = 0;

let startTime;

let timerInterval;


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


    document.getElementById(
        "date-time"
    ).textContent =
        dateStr;


    document.getElementById(
        "final-time"
    ).textContent =
        time + " 秒";


    document.getElementById(
        "miss-result"
    ).textContent =
        "ミス：" + missCount + " 回";


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
        "iroiro-index.html";

};


/* =========================
   初期化
========================= */

renderCards();

startGame();