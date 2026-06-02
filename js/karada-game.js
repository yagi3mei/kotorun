// =========================================
//      File: karada-game.js
//      Purpose: からだゲームのゲーム画面
//      Author: やぎさん
//      Created: 2026-06-01
// 
//      Notes:
//      - からだゲームの共通JavaScriptファイル
//      - karada-index.htmlからゲームタイプをURLパラメータで受け取って、ゲームの内容を切り替える
//      - ゲームのロジック（問題選択、入力判定、タイマー、ミスカウントなど）を実装
// ========================================= 


// ストレージ読み書き
import faceParts
    from "../data/body/face.js";

import upperParts
    from "../data/body/upperParts.js";

    
import {
    saveScore,
    getScore
}
from "./storage.js";


const image = document.getElementById("faceImage");
const marker = document.getElementById("marker");
const questionText =
    document.getElementById("questionText");
const choicesContainer =
    document.getElementById("choicesContainer");
const QUESTION_TEXT = "これは？";
const QUESTION_SPEECH = "これわ？";
// のこり問題数
const remainingDisplay =
    document.getElementById(
        "remaining-display"
    );
// ミス数
const missDisplay =
    document.getElementById(
        "miss-display"
    );

const resultModal =
    document.getElementById(
        "result-modal"
    );

const missResult =
    document.getElementById(
        "miss-result"
    );

const finalTime =
    document.getElementById(
        "final-time"
    );

const timerDisplay =
    document.getElementById(
        "timer-display"
    );
    
const dateTime =
    document.getElementById(
        "date-time"
    );

const wrongListArea =
    document.getElementById(
        "wrong-list-area"
    );

const params =
    new URLSearchParams(
        window.location.search
    );

const category =
    params.get("category");

const gameLevelLabel =
    document.getElementById(
        "game-level-label"
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

const wrongSound =
    document.getElementById(
        "sound-wrong"
    );


// 状態変数
let currentQuestion = null;
let isAnswerLocked = false;
let questionList = [];
let currentIndex = 0;
let missCount = 0;
let wrongAnswers = [];
let timer = null;
let startTime = null;
let elapsedTime = 0;
let categoryLabel = "";


function showQuestion(question)
{
    // 試験用にコンソールへ問題を表示する。あとで削除予定！
    console.log(question.word);

    questionText.textContent =
        QUESTION_TEXT;

    const scaleX =
        image.clientWidth / 512;

    const scaleY =
        image.clientHeight / 512;

    marker.style.left =
        (question.x * scaleX) + "px";

    marker.style.top =
        (question.y * scaleY) + "px";

    speak(QUESTION_SPEECH);
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


function nextQuestion()
{
    currentQuestion =
        questionList[currentIndex];

    showQuestion(currentQuestion);

    renderChoices(currentQuestion);
}

function renderChoices(question)
{
    choicesContainer.innerHTML = "";

    const choices = [
        question.word
    ];

    while (choices.length < 4)
    {
        const randomPart =
            questionList[
                Math.floor(
                    Math.random()
                    * questionList.length
                )
            ];

        if (!choices.includes(randomPart.word))
        {
            choices.push(randomPart.word);
        }
    }

    choices.sort(() => Math.random() - 0.5);

    choices.forEach(choice =>
    {
        const button =
            document.createElement(
                "button"
            );

        button.className =
            "choice-btn";

        button.textContent =
            choice;

        button.addEventListener("click", () =>
        {
            checkAnswer(
                choice,
                button
            );
        });

        choicesContainer.appendChild(button);
    });
}

function checkAnswer(
    selectedWord,
    button
)
{
    // 連続クリック防止
    if (isAnswerLocked)
    {
        return;
    }

    if (selectedWord === currentQuestion.word)
    {
        isAnswerLocked = true;

        speak(currentQuestion.speech, () =>
        {
            currentIndex++;

            if (
                currentIndex >=
                questionList.length
            )
            {
                showResultModal();

                return;
            }

            updateStatus();

            nextQuestion();

            isAnswerLocked = false;
        });
    }
    else
    {
        isAnswerLocked = true;

        wrongSound.volume = 0.3;

        wrongSound.currentTime = 0;

        wrongSound.play();

        missCount++;

        if (
            !wrongAnswers.includes(
                currentQuestion.word
            )
        )
        {
            wrongAnswers.push(
                currentQuestion.word
            );
        }

        // ボタンを振動させる
        button.style.animation =
            "shake 0.2s";

        setTimeout(() =>
        {
            button.style.animation = "";
        }, 200);

        updateStatus();

        // 音声再生終了後に回答ロックを解除する
        wrongSound.onended = () =>
        {
            isAnswerLocked = false;
        };
    }
}

// タイマー表示更新
function updateTimerDisplay()
{
    const seconds =
        (
            elapsedTime / 1000
        ).toFixed(2);

    timerDisplay.textContent =
        seconds;
}

// タイマー開始
function startTimer()
{
    startTime = Date.now();

    timer = setInterval(() =>
    {
        elapsedTime =
            Date.now()
            - startTime;

        updateTimerDisplay();

    }, 10);
}

function updateStatus()
{
    remainingDisplay.textContent =
        "のこり：" +
        (
            questionList.length
            - currentIndex
        );

    missDisplay.textContent =
        "ミス：" +
        missCount;
}

function showResultModal()
{
    // タイマー停止
    clearInterval(timer);
    timer = null;

    const now =
        new Date();

    const result = {
        time:
            Number(
                (
                    elapsedTime / 1000
                ).toFixed(2)
            ),
        miss: missCount,
        date:
            new Date()
                .toLocaleString("ja-JP")
    };

    const isBest =
        saveScore(
            "karada",
            category,
            result
        );

    const bestScore =
        getScore(
            "karada",
            category
        );

    if (isBest)
    {
        bestMessage.textContent =
            "🎉 ベストきろく　こうしん！";

        bestDate.textContent = "";

        bestMiss.textContent = "";

        bestTime.textContent = "";
    }
    else if (bestScore)
    {
        bestMessage.textContent = "";

        bestDate.textContent =
            `いつ：${bestScore.date}`;

        bestMiss.textContent =
            `ミス：${bestScore.miss}回`;

        bestTime.textContent =
            `タイム：${bestScore.time}秒`;
    }

    gameLevelLabel.textContent =
        `【${categoryLabel}】`;

        dateTime.textContent =
        now.toLocaleString("ja-JP");

    missResult.textContent =
        `ミス：${missCount}`;

    finalTime.textContent =
        `タイム：${(
            elapsedTime / 1000
        ).toFixed(2)}秒`;
    
    wrongListArea.innerHTML = "";

    wrongAnswers.forEach(
        answer =>
        {
            const p =
                document.createElement(
                    "p"
                );

            p.textContent =
                answer;

            wrongListArea.appendChild(
                p
            );
        }
    );

    resultModal.classList.remove(
        "hidden"
    );
}

function restartGame()
{
    resultModal.classList.add(
        "hidden"
    );

    speechSynthesis.cancel();

    currentIndex = 0;

    missCount = 0;

    wrongAnswers = [];

    isAnswerLocked = false;

    startGame();

    updateStatus();
}

function goBack()
{
    location.href =
        "karada-index.html";
}

// ゲームスタート
function startGame()
{
    // タイマー初期化
    elapsedTime = 0;

    timerDisplay.textContent =
        "0.00";

    // 既存タイマー停止
    clearInterval(timer);

    timer = null;

    // タイマー開始
    startTimer();

    // メニューに応じた問題リストを作成
    if (category === "face")
    {
        image.src =
            "images/body/face.png";
        questionList = [...faceParts];
        categoryLabel = "かお（顔）";
    }
    else if (category === "upper")
    {
        image.src =
            "images/body/upperParts.png";
        questionList = [...upperParts];
        categoryLabel = "じょうはんしん（上半身）";
    }
    else if (category === "lower")
    {
        image.src =
            "images/body/lowerParts.png";
        questionList = [...lowerParts];
        categoryLabel = "かはんしん（下半身）"; 
    }

    shuffle(questionList);

    currentIndex = 0;

    updateStatus();

    nextQuestion();
}

// ゲーム開始
startGame();

window.restartGame =
    restartGame;

window.goBack =
    goBack;