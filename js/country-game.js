/* =========================================
    File: country-game.js
    Purpose: 国・地域名ゲーム プレイロジック
    Author: やぎさん
    Created: 2026-06-08

    Notes:

    * 国旗＋地図画像を見て国・地域名を答える
    * 4択は毎回ランダム生成
    * 音声は「ここは？」→ 正解時に国名読み上げ
    * LocalStorageベスト記録対応
    * Google Analytics対応
  ========================================= */

import countryData
    from "../data/country/country-data.js";

import {
        saveScore,
        getScore
    }
    from "./storage.js";

/* =========================
DOM取得
========================= */

const imageDisplay =
    document.getElementById(
    "question-image"
    );

const questionDisplay =
    document.getElementById(
    "question-display"
    );

const choicesArea =
    document.getElementById(
    "choices-area"
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

const wrongListArea =
    document.getElementById(
    "wrong-list"
    );

const QUESTION_COUNT = 10;  // 出題数


/* =========================
状態変数
========================= */
let gameQuestions = [];

let used = [];

let currentQuestion = null;

let missCount = 0;

let wrongQuestions = [];

let startTime;

let timerInterval;

let isAnswerLocked = false;


/* =========================
問題生成
========================= */
function createGameQuestions() {

    gameQuestions =
        [...countryData]
            .sort(() => Math.random() - 0.5)
            .slice(0, QUESTION_COUNT);

}

function loadQuestion() {

    const remain =
        gameQuestions.filter(
            x => !used.includes(x.id)
        );

    remainingDisplay.textContent =
        "のこり：" + remain.length;

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

    renderQuestion();

}


/* =========================
問題表示
========================= */
function renderQuestion() {

    imageDisplay.src =
        "images/country/" +
        currentQuestion.img;

    imageDisplay.alt =
        currentQuestion.country;

    questionDisplay.textContent =
        "ここは？";

    renderChoices();

    playQuestionAudio();

}


/* =========================
選択肢生成
========================= */
function renderChoices() {

    choicesArea.innerHTML = "";

    const others =
        countryData.filter(
            x => x.id !== currentQuestion.id
        );

    const shuffled =
        [...others].sort(
            () => Math.random() - 0.5
        );

    const choices = [

        currentQuestion.country,

        shuffled[0].country,
        shuffled[1].country,
        shuffled[2].country

    ].sort(
        () => Math.random() - 0.5
    );

    choices.forEach(choice => {

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "choice-btn";

        button.textContent =
            choice;

        button.addEventListener(
            "click",
            () => checkAnswer(
                choice,
                button
            )
        );

        choicesArea.appendChild(
            button
        );

    });

}


/* =========================
問題音声
========================= */
function playQuestionAudio() {

    speechSynthesis.cancel();

    const utter =
        new SpeechSynthesisUtterance(
            "ここは"
        );

    utter.lang = "ja-JP";

    speechSynthesis.speak(
        utter
    );

}


/* =========================
正解音声
========================= */
function playCorrectAudio(
        callback
    ) {

    speechSynthesis.cancel();

    const utter =
        new SpeechSynthesisUtterance(
            currentQuestion.reading
        );

    utter.lang = "ja-JP";

    utter.rate = 0.9;

    utter.onend = () => {

        callback();

    };

    speechSynthesis.speak(
        utter
    );

}


/* =========================
スピーカーボタン
========================= */
document
    .getElementById("sound-btn")
    .addEventListener(
        "click",
        playQuestionAudio
    );


/* =========================
回答判定
========================= */
function checkAnswer(
        choice,
        button
    ) {

    if (isAnswerLocked) {
        return;
    }

    isAnswerLocked = true;

    if (
        choice ===
        currentQuestion.country
    ) {

        playCorrectAudio(
            () => {

                loadQuestion();

                isAnswerLocked = false;

            }
        );

    } else {

        const wrongSound =
            document.getElementById(
                "sound-wrong"
            );

        wrongSound.currentTime = 0;

        wrongSound.play();

        button.style.animation =
            "shake 0.2s";

        setTimeout(() => {

            button.style.animation =
                "";

            isAnswerLocked = false;

        }, 200);

        missCount++;

        missDisplay.textContent =
            "ミス：" + missCount;

        if (
            !wrongQuestions.includes(
                currentQuestion.country
            )
        ) {

            wrongQuestions.push(
                currentQuestion.country
            );

        }

    }

}


/* =========================
結果表示
========================= */
function showResult() {

    clearInterval(
        timerInterval
    );

    const now =
        new Date();

    const dateStr =
        now.toLocaleString();

    const time =
        (
            (
                performance.now()
                - startTime
            ) / 1000
        ).toFixed(2);

    const oldBest =
        getScore(
            "country",
            "country_game"
        );

    const isBest =
        !oldBest
        || missCount < oldBest.miss
        || (
            missCount === oldBest.miss
            && Number(time)
                < oldBest.time
        );

    saveScore(
        "country",
        "country_game",
        {
            time: Number(time),
            miss: missCount,
            date: dateStr
        }
    );

    if (
        typeof gtag === "function"
    ) {

        gtag(
            "event",
            "game_clear",
            {
                game: "country",
                mode: "country_game",
                miss: missCount,
                time: Number(time)
            }
        );

    }

    const best =
        getScore(
            "country",
            "country_game"
        );

    gameTypeLabel.textContent =
        "【くに・ちいきゲーム】";

    dateTime.textContent =
        dateStr;

    missResult.textContent =
        `ミス：${missCount}回`;

    finalTime.textContent =
        `タイム：${time}秒`;

    wrongListArea.innerHTML =
        wrongQuestions.join("<br>");

    if (isBest) {

        bestMessage.textContent =
            "🎉 ベストきろく　こうしん！";

        bestDate.textContent = "";
        bestMiss.textContent = "";
        bestTime.textContent = "";

    } else {

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

    createGameQuestions();

    used = [];

    missCount = 0;

    wrongQuestions = [];

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
                    (
                        performance.now()
                        - startTime
                    ) / 1000
                ).toFixed(2);

        }, 50);

    loadQuestion();

}

/* =========================
リスタート
========================= */

window.restartGame =
    function() {

    resultModal.classList.add(
        "hidden"
    );

    startGame();

};

/* =========================
メニューへ戻る
========================= */

window.goMenu =
    function() {

    location.href =
        "kotoba-index.html";

};

/* =========================
初期化
========================= */

startGame();
