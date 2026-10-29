// =========================================
//      File: karuta-game.js
//      Purpose: たんごかるたゲームのプレイロジック（問題生成・判定・結果表示）
//      Author: やぎさん
//      Created: 2026-04-09
//      Updated: 2026-04-30: CSSファイル分割に伴う読み込み構造の変更
//      Updated: 2026-05-17: かるたゲームからたんごかるたへ名称変更
//      Updated: 2026-05-20: LocalStorageベスト記録保存・結果モーダル拡張対応
//      Updated: 2026-06-05: google analytics イベント送信追加
//      Updated: 2026-07-24：kotobasagashi-game.htmlへのリンク追加
// 
//      Notes:
//      - たんごかるたゲームの共通JavaScriptファイル
//      - karuta-list.htmlからURLパラメータ（type, kana）を受け取りゲーム内容を切り替える
//      - 動的importを使用してデータファイル（../data/${type}_${kana}.js）を読み込む
//      - ゲームのロジック（問題選択、入力判定、タイマー、ミスカウントなど）を実装
//      - LocalStorageにベスト記録を保存
// ========================================= 

import {
    saveScore,
    getScore
} from "./storage.js";

import {
    showResultModal
} from "./result-modal.js";


const params = new URLSearchParams(window.location.search);

const type = params.get("type") || "hira";
const group = params.get("group") || "seion";
const kana = params.get("kana") || "a";
const kanaLabel = params.get("label") || kana;

const module =
    await import(`../data/kana/${type}/${group}/${type}_${kana}.js`);

const data = module.default;

const timerDisplay =
    document.getElementById("timer-display");

const missDisplay =
    document.getElementById("miss-display");


/* =========================
    画像フォルダ定数
========================= */

const IMAGE_DIR_MAP = {

    hira: {
        seion: "images/hiragana-seion/",
        dakuon: "images/hiragana-dakuon/",
        youon: "images/hiragana-youon/"
    },

    kata: {
        seion: "images/katakana-seion/",
        dakuon: "images/katakana-dakuon/"
    }

};


/* type + group に応じて自動切替 */
const IMAGE_DIR =
    IMAGE_DIR_MAP[type]?.[group]
    || "images/hiragana-seion/";

const typeDisplay =
    type === "hira"
      ? "ひらがな"
      : "カタカナ";


/* DOMキャッシュ */
const romajiDisplay =
    document.getElementById("romaji-display");

const cardsDiv =
    document.getElementById("cards");

const remainingDisplay =
    document.getElementById("remaining-display");

const resultModal =
    document.getElementById("result-modal");


/* 状態管理 */
let questionCount = 0;
let missCount = 0;
let startTime = performance.now();
let timerInterval;

let correctAnswer = null;
let isAnswerLocked = false;

let wrongAnswers = [];
let usedQuestions = [];


/* 初期描画 */
remainingDisplay.textContent =
    "のこり：" + data.length;

missDisplay.textContent =
    "ミス：0";


/* =========================
    localStorageキー
========================= */
function getStorageKey() {

    return `${type}-${group}-${kana}`;

}


/* 配列シャッフル */
function shuffle(array) {

    return array.sort(() => Math.random() - 0.5);

}


/* =====================
問題生成
===================== */
function loadQuestion() {

    const remaining = data.filter(
        item => !usedQuestions.includes(item.id)
    );


    if (questionCount === 0) {

        startTime = performance.now();

        timerInterval = setInterval(() => {

            const t =
                (performance.now() - startTime) / 1000;

            timerDisplay.textContent =
                t.toFixed(2);

        }, 50);

    }


    remainingDisplay.textContent =
      "のこり：" + remaining.length;


    if (remaining.length === 0) {

      showResult();
      return;

    }


    correctAnswer =
        remaining[
            Math.floor(Math.random() * remaining.length)
        ];

    usedQuestions.push(correctAnswer.id);

    romajiDisplay.textContent =
        correctAnswer.romaji;


    /* カード生成 */
    const selected = shuffle([...data]);

    cardsDiv.innerHTML = "";

    selected.forEach(item => {

        const card = document.createElement("div");

        card.className = "card";

        const img = document.createElement("img");

        img.src = IMAGE_DIR + item.img;

        const label = document.createElement("div");

        label.className = "card-label";

        label.textContent = item.word;

        card.appendChild(img);
        card.appendChild(label);

        card.onclick =
            () => checkAnswer(item, card);

        cardsDiv.appendChild(card);

    });


    setTimeout(() => {

        playAudio();

    }, 500);

    isAnswerLocked = false;

}


/* =====================
音声
===================== */
window.playAudio = function () {

    const utter =
        new SpeechSynthesisUtterance(
            correctAnswer.sentence
        );

    utter.lang = "ja-JP";

    speechSynthesis.cancel();

    speechSynthesis.speak(utter);

};

document
    .getElementById("sound-btn")
    .addEventListener("click", playAudio);


/* =====================
回答判定
===================== */
function checkAnswer(selected, card) {

      /* 連打防止 */
    if (isAnswerLocked) {
        return;
    }

    isAnswerLocked = true;


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


        if (!wrongAnswers.includes(correctAnswer.id)) {

            wrongAnswers.push(correctAnswer.id);

        }


        card.style.animation =
            "shake 0.3s";

        setTimeout(() => {
            card.style.animation = "";

            // アニメーション終了後にロック解除
            isAnswerLocked = false;
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
        ((endTime - startTime) / 1000).toFixed(2);

    const now = new Date();

    const dateStr =
        now.toLocaleString();

    /* =====================
        今回の結果
    ===================== */
    const result = {
        time: Number(time),
        miss: missCount,
        date: dateStr
    };

    /* =====================
        スコア保存・ベスト更新判定
    ===================== */
    const updated = saveScore(
        "karuta",
        getStorageKey(),
        result
    );

    // Google Analytics イベント送信
    if (typeof gtag === "function") {
        gtag(
            "event",
            "game_clear",
            {
                game: "karuta",
                mode: getStorageKey(),
                miss: result.miss,
                time: result.time
            }
        );
    }

    /* =====================
        保存後ベスト取得
    ===================== */
    const best = getScore(
        "karuta",
        getStorageKey()
    );

    /* =====================
        まちがえた単語
    ===================== */
    const wrongQuestions = data
        .filter(item => wrongAnswers.includes(item.id))
        .map(item => ({
            question: item.romaji,
            answer: item.word
        }));

    /* =====================
        共通結果モーダル表示
    ===================== */
    showResultModal({
        gameName: `${typeDisplay}　${kanaLabel}`,
        date: dateStr,
        time: Number(time),
        missCount: missCount,
        bestUpdated: updated,
        bestRecord: best,
        wrongQuestions: wrongQuestions
    });

}



/* =====================
再スタート
===================== */
window.restartGame = function () {

    questionCount = 0;

    missCount = 0;

    startTime = Date.now();

    usedQuestions = [];
    wrongAnswers = [];

    missDisplay.textContent =
        "ミス：0";

    remainingDisplay.textContent =
        "のこり：" + data.length;

    resultModal.classList.add("hidden");

    loadQuestion();

};


/* =====================
ことばさがしへ
===================== */
window.goKotobasagashi = function ()
{
    location.href =
        `kotobasagashi-game.html`
        + `?type=${type}`
        + `&group=${group}`
        + `&kana=${kana}`
        + `&label=${kanaLabel}`;
};


/* =====================
戻る
===================== */
window.goBack = function () {

    location.href =
        `karuta-list.html?type=${type}&group=${group}`;

};


/* 初期実行 */
loadQuestion();