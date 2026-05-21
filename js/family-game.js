// =========================================
//      File: family-game.js
//      Purpose: かるたゲーム内のfamilyモードのプレイロジック（問題生成・判定・結果表示）
//      Author: やぎさん
//      Created: 2026-04-09
//      Updated: 2026-04-30: CSSファイル分割に伴う読み込み構造の変更
//      Updated: 2026-05-21: storage対応
//
//      Notes:
//      - 家族ゲームの共通JavaScriptファイル
//      - family-index.htmlからURLパラメータ（mode: inner / outer）を受け取りゲーム内容を切り替える
//      - かるたゲームの一部として家族テーマを扱うモード
//      - ゲームのロジック（問題選択、入力判定、タイマー、ミスカウントなど）を実装
// ========================================= 

import { saveScore, getScore } from "./storage.js";

const params=new URLSearchParams(location.search);

// mode: inner（自分の家族） / outer（他人の家族）
const mode=params.get("mode") || "inner";

/* メニュー表示名 */
let modeLabel = "";

if (mode === "inner") {

    modeLabel = "うちの かぞく";

} else if (mode === "outer") {

    modeLabel = "ともだちの かぞく";

} else if (mode === "relative") {

    modeLabel = "しんせきの かぞく";
}

document.getElementById(
    "family-mode-label"
).textContent=modeLabel;


/* =========================
   storage key
========================= */
function getStorageKey() {

    return mode;
}


/* =========================
   結果モーダル
========================= */
const gameTypeLabel =
    document.getElementById(
        "game-type-label"
    );

const dateTime =
    document.getElementById(
        "date-time"
    );

const missResult =
    document.getElementById(
        "miss-result"
    );

const finalTime =
    document.getElementById(
        "final-time"
    );

const bestMessage =
    document.getElementById(
        "best-message"
    );

const bestDate =
    document.getElementById(
        "best-date"
    );

const bestMiss =
    document.getElementById(
        "best-miss"
    );

const bestTime =
    document.getElementById(
        "best-time"
    );

const wordListArea =
    document.getElementById(
        "word-list-area"
    );


/* =====================
   レイアウト切り替え
===================== */

const normalBoard =
    document.getElementById(
        "family-board-normal"
    );

const relativeBoard =
    document.getElementById(
        "family-board-relative"
    );

if (mode === "relative") {

    normalBoard.classList.add(
        "hidden"
    );

    relativeBoard.classList.remove(
        "hidden"
    );

} else {

    normalBoard.classList.remove(
        "hidden"
    );

    relativeBoard.classList.add(
        "hidden"
    );

}

/* 中間表示 */
if (mode !== "relative") {

    let centerLabel = "わたし";

    if (mode === "outer") {

        centerLabel = "ともだち";
    }

    document.getElementById(
        "family-center"
    ).textContent = centerLabel;
}


/* データ */
const module=
    await import(
        `../data/family/${mode}.js`
    );

const data=module.default;


/* =========================
   表示IDマッピング
========================= */
let mapping = {};

if (mode === "relative") {

    mapping = {

        sofu:"relative-sofu",
        sobo:"relative-sobo",
        ojisan:"relative-ojisan",
        obasan:"relative-obasan",
        itoko:"relative-itoko"
    };

} else {

    mapping = {

        sofu:"sofu",
        sobo:"sobo",
        chichi:"chichi",
        haha:"haha",
        ani:"ani",
        ane:"ane",
        otouto:"otouto",
        imouto:"imouto",

        ojiisan:"sofu",
        obaasan:"sobo",
        otousan:"chichi",
        okaasan:"haha",
        oniisan:"ani",
        oneesan:"ane"
    };
}

const resultModal =
    document.getElementById(
        "result-modal"
    );

let used=[];
let wrongWords=[];

let correctAnswer=null;
let missCount=0;
let questionCount = 0;

let startTime;
let timerInterval;

const timerDisplay=
    document.getElementById(
        "timer-display"
    );

const remainingDisplay=
    document.getElementById(
        "remaining-display"
    );

const missDisplay=
    document.getElementById(
        "miss-display"
    );


/* =====================
   初期描画
===================== */
function renderCards(){

    data.forEach(item=>{

        const card=
            document.getElementById(
                mapping[item.id]
            );

        if (!card) {
            return;
        }

        card.innerHTML=`
            <img src="images/family/${item.img}">
            <div class="family-label">
                ${item.word}
            </div>
        `;

        card.onclick=()=>{
            checkAnswer(item,card);
        };

    });

}


/* =====================
   問題生成
===================== */
function loadQuestion(){

    const remain=
        data.filter(
            x=>!used.includes(x.id)
        );

    remainingDisplay.textContent=
        "のこり："+remain.length;

    if(remain.length===0){

        showResult();
        return;
    }

    correctAnswer=
        remain[
            Math.floor(
                Math.random()*remain.length
            )
        ];

    used.push(
        correctAnswer.id
    );

    document.getElementById(
        "romaji-display"
    ).textContent=
        correctAnswer.romaji;

    playAudio();

}


/* =====================
   音声
===================== */
function playAudio(){

    const u=
        new SpeechSynthesisUtterance(
            correctAnswer.sentence
        );

    u.lang="ja-JP";

    speechSynthesis.cancel();

    speechSynthesis.speak(u);

}

document
    .getElementById("sound-btn")
    .addEventListener(
        "click",
        playAudio
    );


/* =====================
   回答判定
===================== */
function checkAnswer(selected, card) {

    if (selected.id === correctAnswer.id) {

        speechSynthesis.cancel();

        const sound =
            new Audio("sounds/correct.mp3");

        sound.volume = 0.4;

        sound.play();

        questionCount++;

        setTimeout(() => {

            loadQuestion();

        }, 500);

    } else {

        const sound =
            new Audio("sounds/wrong.mp3");

        sound.volume = 0.4;

        sound.play();

        missCount++;

        missDisplay.textContent =
            "ミス：" + missCount;

        if (!wrongWords.includes(correctAnswer.id)) {

            wrongWords.push(correctAnswer.id);

        }

        card.style.animation =
            "shake 0.3s";

        setTimeout(() => {

            card.style.animation = "";

        }, 300);
    }
}


/* =====================
   結果表示
===================== */
function showResult() {

    clearInterval(timerInterval);

    const endTime = performance.now();

    const time =
        (
            (endTime - startTime) / 1000
        ).toFixed(2);

    const now = new Date();

    const dateStr =
        now.toLocaleString();


    /* =====================
       ベスト判定
    ===================== */
    const oldBest =
        getScore(
            "family",
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
        "family",
        getStorageKey(),
        {
            time: Number(time),
            miss: missCount,
            date: dateStr
        }
    );

    const best =
        getScore(
            "family",
            getStorageKey()
        );


    /* =====================
       単語一覧
    ===================== */
    let wordList = "";

    data.forEach(item => {

        const isWrong =
            wrongWords.includes(item.id);

        const mark =
            isWrong ? "★" : "　";

        wordList += `
            ${mark} ${item.word}（${item.lesson}課）<br>
        `;
    });

    wordListArea.innerHTML = wordList;


    /* =====================
       今回結果
    ===================== */
    gameTypeLabel.textContent =
        `【${modeLabel}】`;

    dateTime.textContent =
        dateStr;

    missResult.textContent =
        `ミス：${missCount}回`;

    finalTime.textContent =
        `タイム：${time}秒`;


    /* =====================
       ベスト
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


/* =====================
   再スタート
===================== */
window.restartGame=function(){

    used=[];
    wrongWords=[];

    missCount=0;
    questionCount=0;

    missDisplay.textContent=
        "ミス：0";

    resultModal.classList.add(
        "hidden"
    );

    start();
};


/* =====================
   戻る
===================== */
window.goBack=function(){

    location.href =
        "family-index.html";
};


/* =====================
   ゲーム開始
===================== */
function start(){

    startTime=
        performance.now();

    clearInterval(
        timerInterval
    );

    timerInterval=
        setInterval(()=>{

            timerDisplay.textContent=
            (
                (performance.now()-startTime)
                /1000
            ).toFixed(2);

        },50);

    loadQuestion();

}

renderCards();
start();