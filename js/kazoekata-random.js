/* =========================================
File: kazoekata-random.js
Purpose: かぞえかたランダム
Author: やぎさん
Created: 2026-06-09
Updated: 2026-10-29: result-modal.js利用へ変更

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
} from "./storage.js";

/* =========================
   Modal 読込
========================= */
import {
    showResultModal,
    hideResultModal
} from "./result-modal.js";

/* =========================
   共通タイマー 読込
========================= */
import {
    startTimer,
    stopTimer
} from "./timer.js";

/* =========================
   共通ステータス表示
========================= */
import {
    updateRemainingDisplay,
    updateMissDisplay
} from "./status.js";

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


/* =========================
状態変数
========================= */
let gameQuestions = [];
let used = [];
let currentQuestion = null;
let missCount = 0;
let wrongQuestions = [];
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

    const remainingCount = remain.length;
    updateRemainingDisplay(remainingDisplay, remainingCount);

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

        updateMissDisplay(missDisplay, missCount);

        /* 間違え記録 */
        if (
            !wrongQuestions.includes(
                currentQuestion.reading
            )
        ) {

            wrongQuestions.push(
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
        "kazoekata",
        "random",
        result
    );

    const best =
        getScore(
            "kazoekata",
            "random"
        );


    /* =====================
        間違えた正解一覧
    ===================== */
    const wrongQuestionItems = wrongQuestions.map(item => ({
        question: "",
        answer: item
    }));


    /* =====================
        今回結果
    ===================== */
    showResultModal({

        gameName: "かぞえかた",
        gameType: "ランダム",
        category: "kazoekata",
        gameKey: "random",
        date: dateStr,
        time: time,
        missCount: missCount,
        bestUpdated: updated,
        bestRecord: best,
        wrongQuestions: wrongQuestionItems

    }, {

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

    createGameQuestions();

    missCount = 0;

    used = [];

    wrongQuestions = [];


    updateMissDisplay(missDisplay, missCount);

    // 共通タイマー開始
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
