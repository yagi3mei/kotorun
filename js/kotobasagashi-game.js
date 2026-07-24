// =========================================
// File: kotobasagashi-game.js
// Purpose: ことばさがしゲーム
// Author: やぎさん
// Created: 2026-07-15
//
// Notes:
// ・ことばさがしゲーム共通JS
// ・URLパラメータからデータを読み込む
// ・ゲームロジックを管理する
// =========================================

import { saveScore, getScore } from "./storage.js";

const params = new URLSearchParams(window.location.search);

const type = params.get("type") || "hira";
const group = params.get("group") || "seion";
const kana = params.get("kana") || "a";
const kanaLabel = params.get("label") || kana;

const module =
    await import(
        `../data/kana/${type}/${group}/${type}_${kana}.js`
    );

const data = module.default;

const timerDisplay =
    document.getElementById("timer-display");

const remainingDisplay =
    document.getElementById("remaining-display");

const missDisplay =
    document.getElementById("miss-display");

const QUESTION_TEXT =
    "これは？";

const QUESTION_SPEECH =
    "これわ";

const hintText =
    document.getElementById("hintText");

const hintValue =
    document.getElementById("hintValue");

const questionImage =
    document.getElementById("questionImage");

const wordGrid =
    document.getElementById("word-grid");

const checkBtn =
    document.getElementById("check-btn");

const soundBtn =
    document.getElementById("sound-btn");

const questionText =
    document.getElementById("questionText");

const wrongListArea =
    document.getElementById("wrong-list-area");

    const resultModal =
    document.getElementById("result-modal");

const gameTypeLabel =
    document.getElementById("game-type-label");

const dateTime =
    document.getElementById("date-time");

const missResult =
    document.getElementById("miss-result");

const finalTime =
    document.getElementById("final-time");

const bestMessage =
    document.getElementById("best-message");

const bestDate =
    document.getElementById("best-date");

const bestMiss =
    document.getElementById("best-miss");

const bestTime =
    document.getElementById("best-time");

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

const IMAGE_DIR =
    IMAGE_DIR_MAP[type]?.[group]
    || "images/hiragana-seion/";

const typeDisplay =
    type === "hira"
        ? "ひらがな"
        : "カタカナ";

const groupDisplayMap = {

    seion: "せいおん",
    dakuon: "だくおん",
    youon: "ようおん"

};

const groupDisplay =
    groupDisplayMap[group] || "";

// ランダム文字（ひらがな・カタカナ）
const RANDOM_CHARS = {
    hira: [
        "あ","い","う","え","お",
        "か","き","く","け","こ",
        "さ","し","す","せ","そ",
        "た","ち","つ","て","と",
        "な","に","ぬ","ね","の",
        "は","ひ","ふ","へ","ほ",
        "ま","み","む","め","も",
        "や","ゆ","よ",
        "ら","り","る","れ","ろ",
        "わ","を","ん"
    ],
    kata: [
        "ア","イ","ウ","エ","オ",
        "カ","キ","ク","ケ","コ",
        "サ","シ","ス","セ","ソ",
        "タ","チ","ツ","テ","ト",
        "ナ","ニ","ヌ","ネ","ノ",
        "ハ","ヒ","フ","ヘ","ホ",
        "マ","ミ","ム","メ","モ",
        "ヤ","ユ","ヨ",
        "ラ","リ","ル","レ","ロ",
        "ワ","ヲ","ン"
    ]
};

let questionList = [];
let currentQuestion = null;

let currentIndex = 0;
let missCount = 0;
let wrongAnswers = [];

let startTime = null;
let timerInterval = null;

let selectedCells = [];
let selectedChars = [];

let isAnswerLocked = false;

function startGame()
{
    questionList =
        data.filter(
            item => item.noun !== "-"
        );

    shuffle(questionList);

    currentIndex = 0;
    missCount = 0;

    updateStatus();

    startTimer();

    nextQuestion();
}


function shuffle(array)
{
    for (let i = array.length - 1; i > 0; i--)
    {
        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [array[i], array[j]] =
            [array[j], array[i]];
    }
}

/* =====================
    盤面サイズ取得
===================== */
function getGridSize(word)
{
    const len = word.length;

    if (len === 1)
    {
        return 2;
    }
    else if (len === 2)
    {
        return 3;
    }
    else if (len === 3)
    {
        return 4;
    }
    else if (len === 4)
    {
        return 5;
    }
    else if (len === 5)
    {
        return 6;
    }
    else if (len === 6)
    {
        return 7;
    }
    else
    {
        return 8;
    }
}

// =====================
// 盤面を作成
// =====================
function createGrid(size)
{
    wordGrid.innerHTML = "";

    wordGrid.className =
        `word-grid size${size}`;

    for (let i = 0; i < size * size; i++)
    {
        const cell =
            document.createElement("div");

        cell.className = "word-cell";

        cell.addEventListener("click", () =>
        {
            toggleCell(cell);
        });

        wordGrid.appendChild(cell);
    }
}

// =====================
// 単語配置（横・縦）
// =====================
function placeWord(size)
{
    const wordChars =
        [...currentQuestion.noun];

    const cells =
        wordGrid.querySelectorAll(".word-cell");

    // まず全部ランダム文字
    cells.forEach(cell =>
    {
        cell.textContent =
            getRandomChar(wordChars);
    });

    // 配置方向
    const direction =
        Math.random() < 0.5
            ? "horizontal"
            : "vertical";

    let startRow;
    let startCol;

    if (direction === "horizontal")
    {
        startRow =
            Math.floor(
                Math.random() * size
            );

        startCol =
            Math.floor(
                Math.random() *
                (size - wordChars.length + 1)
            );

        for (let i = 0; i < wordChars.length; i++)
        {
            const index =
                startRow * size +
                startCol + i;

            cells[index].textContent =
                wordChars[i];
        }
    }
    else
    {
        startRow =
            Math.floor(
                Math.random() *
                (size - wordChars.length + 1)
            );

        startCol =
            Math.floor(
                Math.random() * size
            );

        for (let i = 0; i < wordChars.length; i++)
        {
            const index =
                (startRow + i) * size +
                startCol;

            cells[index].textContent =
                wordChars[i];
        }
    }

}

// =====================
// 選択文字判定
// =====================
function checkSelection()
{
    // 正解文字列
    const answer =
        [...currentQuestion.noun];

    // 選択文字列
    const selected =
        [...selectedChars];

    let isCorrect = false;

    // 文字数が一致している場合だけ比較
    if (selected.length === answer.length)
    {
        answer.sort();
        selected.sort();

        isCorrect =
            answer.every(
                (char, index) =>
                    char === selected[index]
            );
    }

    // -----------------
    // 正解
    // -----------------
    if (isCorrect)
    {

        speakWord(() =>
        {
            currentIndex++;

            if (currentIndex >= questionList.length)
            {
                stopTimer();

                showResult();

                return;
            }

            selectedCells = [];
            selectedChars = [];

            updateStatus();

            nextQuestion();
        });
    }

    // -----------------
    // 不正解
    // -----------------
    else
    {

        const sound =
            new Audio("sounds/wrong.mp3");

        sound.volume = 0.4;

        sound.play();

        missCount++;

        updateStatus();

            if (!wrongAnswers.includes(currentQuestion.id))
            {
                wrongAnswers.push(currentQuestion.id);
            }
    }
}

// =====================
// マスの選択・解除
// =====================
function toggleCell(cell)
{
    // 音声読み上げ中は操作禁止
    if (isAnswerLocked)
    {
        return;
    }

    if (cell.classList.contains("selected"))
    {
        cell.classList.remove("selected");

        const index =
            selectedCells.indexOf(cell);

        if (index !== -1)
        {
            selectedCells.splice(index, 1);
            selectedChars.splice(index, 1);
        }
    }
    else
    {
        cell.classList.add("selected");

        selectedCells.push(cell);
        selectedChars.push(cell.textContent);
    }

}


function speak(text, callback = null)
{
    speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = "ja-JP";

    if (callback)
    {
        utterance.onend = callback;
    }

    speechSynthesis.speak(utterance);
}


soundBtn.addEventListener(
    "click",
    () =>
    {
        if (isAnswerLocked)
        {
            return;
        }
        
        // 読み上げ中なら最初から読み直す
        speak(
            QUESTION_SPEECH
        );
    }
);


hintText.addEventListener(
    "click",
    () =>
    {
        if (hintValue.textContent === "")
        {
            hintValue.textContent =
                currentQuestion.hint;
        }
    }
);


// =====================
// 正解音声（単語読み上げ）
// =====================
function speakWord(callback)
{
    isAnswerLocked = true;

    speechSynthesis.cancel();

    const utter =
        new SpeechSynthesisUtterance(
            currentQuestion.speech
            || currentQuestion.noun
        );

    utter.lang = "ja-JP";

    utter.onend = () =>
    {
        isAnswerLocked = false;

        if (callback)
        {
            callback();
        }
    };

    speechSynthesis.speak(utter);
}

// =====================
// ランダム文字を取得
// =====================
function getRandomChar(excludeChars)
{
    const chars =
        RANDOM_CHARS[type].filter(
            ch => !excludeChars.includes(ch)
        );

    const index =
        Math.floor(
            Math.random() * chars.length
        );

    return chars[index];
}

function updateStatus()
{
    remainingDisplay.textContent =
        "のこり：" +
        (questionList.length - currentIndex);

    missDisplay.textContent =
        "ミス：" + missCount;
}


/* =========================
    localStorageキー
========================= */
function getStorageKey()
{
    return `${type}-${group}-${kana}`;
}


// =====================
// タイマー開始
// =====================
function startTimer()
{
    startTime = performance.now();

    timerInterval =
        setInterval(() =>
        {
            const t =
                (performance.now() - startTime)
                / 1000;

            timerDisplay.textContent =
                t.toFixed(2);

        }, 50);
}


// =====================
// タイマー停止
// =====================
function stopTimer()
{
    clearInterval(timerInterval);
}


function loadQuestion()
{
    currentQuestion = data[0];

    questionImage.src =
        IMAGE_DIR + currentQuestion.img;
}

function nextQuestion()
{
    currentQuestion =
        questionList[currentIndex];

    questionImage.src =
        IMAGE_DIR + currentQuestion.img;

    questionText.textContent =
        QUESTION_TEXT;

    // ヒントは最初は非表示
    hintValue.textContent = "";

    // 単語の文字数から盤面サイズを決定
    const gridSize =
        getGridSize(
            currentQuestion.noun
        );

    createGrid(gridSize);

    placeWord(gridSize);

    // -------------------
    // 問題読み上げ中はクリック禁止
    // -------------------
    isAnswerLocked = true;

    speak(
        QUESTION_SPEECH,
        () =>
        {
            isAnswerLocked = false;
        }
    );

}

checkBtn.addEventListener(
    "click",
    checkSelection
);


// =====================
// 結果表示
// =====================
function showResult()
{
    stopTimer();

    const endTime =
        performance.now();

    const time =
        (
            (endTime - startTime)
            / 1000
        ).toFixed(2);

    const now =
        new Date();

    const dateStr =
        now.toLocaleString();

    /* =====================
        ベスト判定
    ===================== */
    const oldBest =
        getScore(
            "kotobasagashi",
            getStorageKey()
        );

    const isBest =
        !oldBest
        || missCount < oldBest.miss
        || (
            missCount === oldBest.miss
            && Number(time) < oldBest.time
        );
        
    gameTypeLabel.textContent =
        `【${typeDisplay}　${groupDisplay}　${kanaLabel}】`;

    dateTime.textContent =
        dateStr;

    missResult.textContent =
        `ミス：${missCount}回`;

    finalTime.textContent =
        `タイム：${time}秒`;
    
    // -----------------
    // 間違えた問題一覧
    // -----------------
    let wordList = "";

    wrongAnswers.forEach(id =>
    {
        const item =
            data.find(q => q.id === id);

        if (item)
        {
            wordList +=
                `${item.noun}（${item.lesson}課）<br>`;
        }
    });

    wrongListArea.innerHTML =
        wordList;

    /* =====================
        スコア保存
    ===================== */
    saveScore(
        "kotobasagashi",
        getStorageKey(),
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
                game: "kotobasagashi",
                mode: getStorageKey(),
                miss: missCount,
                time: Number(time)
            }
        );
    }

    const best =
    getScore(
        "kotobasagashi",
        getStorageKey()
    );

    /* =====================
        ベスト表示
    ===================== */
    if (isBest)
    {
        bestMessage.textContent =
            "🎉 ベストきろく　こうしん！";

        bestDate.textContent = "";

        bestMiss.textContent = "";

        bestTime.textContent = "";
    }
    else
    {
        bestMessage.textContent = "";

        bestDate.textContent =
            `いつ：${best.date}`;

        bestMiss.textContent =
            `ミス：${best.miss}回`;

        bestTime.textContent =
            `タイム：${best.time}秒`;
    }

    resultModal.classList.remove("hidden");
}


// =====================
// もういちど
// =====================
window.restartGame = function ()
{
    // タイマー停止
    clearInterval(timerInterval);

    // タイマー初期化
    startTime = null;
    timerDisplay.textContent = "0.00";

    // 状態初期化
    selectedCells = [];
    selectedChars = [];
    wrongAnswers = [];

    // モーダルを閉じる
    resultModal.classList.add("hidden");

    // ゲーム開始
    startGame();
}


// =====================
// たんごかるたへ
// =====================
window.goKaruta = function ()
{
    location.href =
        `karuta-game.html`
        + `?type=${type}`
        + `&group=${group}`
        + `&kana=${kana}`
        + `&label=${kanaLabel}`;
}


// =====================
// もどるボタン
// =====================
window.goBack = function () {

    location.href =
        `kotobasagashi-list.html?type=${type}&group=${group}`;
}


startGame();
