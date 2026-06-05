/* =========================================
   File: kazoekata-game.js
   Purpose: かぞえかたゲーム プレイロジック
   Author: やぎさん
   Created: 2026-05-12
   Updated: 2026-06-05: google analytics イベント送信追加

   Notes:
   - 助数詞の読み方学習ゲーム
   - イラスト＋数字を見て正しい読みを選択
   - choicesをdata側で管理
   - URLパラメータで種類切替
   - dataMap方式へ変更
========================================= */


/* =========================
   設定読込
========================= */

import config
    from "../data/kazoekata/kazoekata-config.js";

/* =========================
   storage 読込
========================= */
import {
    saveScore,
    getScore
}
from "./storage.js";

/* =========================
   URLパラメータ取得
========================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const type =
    params.get("type") || "hon";


/* =========================
   設定取得
========================= */

const currentConfig =
    config[type] || config.hon;


/* =========================
   データ取得
========================= */

const data =
    currentConfig.data;


/* =========================
   DOM取得
========================= */

const imageDisplay =
    document.getElementById(
        "question-image"
    );

const numberDisplay =
    document.getElementById(
        "number-display"
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

let used = [];

let currentQuestion = null;

let missCount = 0;

let wrongQuestions = [];

let startTime;

let timerInterval;
// 回答ロック（連打防止）
let isAnswerLocked = false;

/* =========================
   問題生成
========================= */

function loadQuestion() {

    const remain =
        data.filter(
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


    renderQuestion();

}


/* =========================
   問題表示
========================= */

function renderQuestion() {

    /* イラスト */
    imageDisplay.src =
        "images/kazoekata/" +
        currentQuestion.img;

    imageDisplay.alt =
        currentQuestion.reading;


    /* 数字 */
    numberDisplay.textContent =
        currentQuestion.number;


    /* 選択肢 */
    renderChoices();


    /* 問題音声 */
    playQuestionAudio();

}


/* =========================
   選択肢生成
========================= */

function renderChoices() {

    choicesArea.innerHTML = "";


    /* choicesコピー */
    let choices =
        [...currentQuestion.choices];


    /* シャッフル */
    choices =
        choices.sort(
            () => Math.random() - 0.5
        );


    /* ボタン生成 */
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
            currentQuestion.questionSpeech
        );

    utter.lang = "ja-JP";

    utter.rate = 0.9;

    speechSynthesis.speak(utter);

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


    /* 読み終わったら次へ */
    utter.onend = () => {

        callback();

    };


    speechSynthesis.speak(utter);

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
function checkAnswer(choice, button) {

    /* 連打防止 */
    if (isAnswerLocked) {
        return;
    }

    isAnswerLocked = true;

    /* 正解 */
    if (
        choice === currentQuestion.reading
    ) {

        speechSynthesis.cancel();

        /* 正解読み */
        playCorrectAudio(() => {

            loadQuestion();

            isAnswerLocked = false;

        });

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
        button.style.animation =
            "shake 0.2s";

        setTimeout(() => {

            button.style.animation = "";

        }, 200);

        /* ブザー終了後に解除 */
        wrongSound.onended = () => {

            isAnswerLocked = false;

        };

        /* ミス数 */
        missCount++;

        missDisplay.textContent =
            "ミス：" + missCount;

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
            type
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
        type,
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
                mode: type,
                miss: result.miss,
                time: result.time
            }
        );
    }

    const best =
        getScore(
            "kazoekata",
            type
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

        `【${currentConfig.label}（${currentConfig.kanji}） ${currentConfig.question}】`;


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