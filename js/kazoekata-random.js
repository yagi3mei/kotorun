/* =========================================
File: kazoekata-random.js
Purpose: かぞえかたランダム
Author: やぎさん
Created: 2026-06-09

Notes:

* 全助数詞混合
* 同じ数字の助数詞で4択生成
* 10問ランダム出題
  ========================================= */

/* =========================
データ読込
========================= */

import koData
from "../data/kazoekata/ko-data.js";

import honData
from "../data/kazoekata/hon-data.js";

import maiData
from "../data/kazoekata/mai-data.js";

import ninData
from "../data/kazoekata/nin-data.js";

import daiData
from "../data/kazoekata/dai-data.js";

import satsuData
from "../data/kazoekata/satsu-data.js";

/* =========================
storage
========================= */

import {
saveScore,
getScore
}
from "./storage.js";

/* =========================
全データ
========================= */

const allData = [
    ...koData,
    ...honData,
    ...maiData,
    ...ninData,
    ...daiData,
    ...satsuData
];

const QUESTION_COUNT = 10;  // 出題数

/* =========================
DOM取得
========================= */

const imageDisplay =
document.getElementById(
"question-image"
);

const questionDisplay =
document.getElementById(
"question-text"
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
        [...allData]
            .sort(
                () => Math.random() - 0.5
            )
            .slice(
                0,
                QUESTION_COUNT
            );

}

/* =========================
問題ロード
========================= */

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
        "images/kazoekata/" +
        currentQuestion.img;

    imageDisplay.alt =
        currentQuestion.item;

    questionDisplay.textContent =
        currentQuestion.item + "が？";

    renderChoices();

    playQuestionAudio();

}

/* =========================
選択肢生成
========================= */

function renderChoices() {

    choicesArea.innerHTML = "";

    const sameNumberData =
        allData.filter(
            x =>
                x.number === currentQuestion.number
        );

    let choices =
        sameNumberData.map(
            x => x.reading
        );

    choices =
        choices.sort(
            () => Math.random() - 0.5
        );

    choices =
        choices.slice(
            0,
            4
        );

    if (
        !choices.includes(
            currentQuestion.reading
        )
    ) {

        choices.pop();

        choices.push(
            currentQuestion.reading
        );

    }

    choices =
        choices.sort(
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
            currentQuestion.item + "が？"
        );

    utter.lang = "ja-JP";

    utter.rate = 0.9;

    speechSynthesis.speak(
        utter
    );

}

/* =========================
正解音声
========================= */

function playCorrectAudio(callback) {

    speechSynthesis.cancel();

    const utter =
        new SpeechSynthesisUtterance(
            currentQuestion.speech
        );

    utter.lang = "ja-JP";

    utter.rate = 0.8;

    utter.onend = () => {

        callback();

    };

    speechSynthesis.speak(
        utter
    );

}

/* =========================
スピーカー
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

function checkAnswer(choice,button) {

    if (isAnswerLocked) {
        return;
    }

    isAnswerLocked = true;

    if (
        choice === currentQuestion.reading
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

        missCount++;

        missDisplay.textContent =
            "ミス：" + missCount;

        if (
            !wrongQuestions.includes(
                currentQuestion.item
            )
        ) {

            wrongQuestions.push(
                currentQuestion.item +
                " → " +
                currentQuestion.reading
            );

        }

        setTimeout(
            () => {

                isAnswerLocked = false;

            },
            200
        );

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
            "kazoekata",
            "random"
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
        "kazoekata",
        "random",
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
                game: "kazoekata",
                mode: "random",
                miss: missCount,
                time: Number(time)
            }
        );
    }

    const best =
        getScore(
            "kazoekata",
            "random"
        );


    /* =====================
       間違え一覧
    ===================== */
    let wrongList = "";

    wrongQuestions.forEach(item => {

        wrongList += `
            ${item}<br>
        `;

    });

    wrongListArea.innerHTML =
        wrongList;


    /* =====================
       今回結果
    ===================== */
    gameTypeLabel.textContent =
         "【じょすうしランダム】";

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

    createGameQuestions();

    missCount = 0;

    used = [];

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
                    (performance.now()
                    - startTime)
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
        "kazoekata-list.html";

};


/* =========================
   初期化
========================= */

startGame();

/* =========================
以下
startGame()
showResult()
restartGame()
goMenu()

は既存
kazoekata-game.js
と同じで流用可
========================= */
