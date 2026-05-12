/* =========================================
   File: kazoekata-game.js
   Purpose: かぞえかたゲーム プレイロジック
   Author: やぎさん
   Created: 2026-05-12

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


/* =========================
   状態変数
========================= */

let used = [];

let currentQuestion = null;

let missCount = 0;

let wrongQuestions = [];

let startTime;

let timerInterval;


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

    /* 正解 */
    if (
        choice === currentQuestion.reading
    ) {

        speechSynthesis.cancel();


        /* 正解読み */
        playCorrectAudio(() => {

            loadQuestion();

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


        /* ミス数 */
        missCount++;

        missDisplay.textContent =
            "ミス：" + missCount;


        /* 間違い記録 */
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


    let wrongList = "";

    wrongQuestions.forEach(item => {

        wrongList += item + "<br>";

    });


    document.getElementById(
        "date-time"
    ).innerHTML =

        `
        実施日時：${dateStr}<br><br>

        【${currentConfig.label}（${currentConfig.kanji}）
        　${currentConfig.question}】
        `;


    document.getElementById(
        "final-time"
    ).textContent =
        time + " 秒";


    document.getElementById(
        "miss-result"
    ).innerHTML =

        `
        ミス：${missCount} 回<br><br>

        まちがえた もんだい<br>

        ${wrongList}
        `;


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