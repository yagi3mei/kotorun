/* =========================================
   File: tokei-test.js
   Purpose: 時計ゲーム UIテスト動作
   Author: やぎさん
   Created: 2026-05-25

   Notes:
   - 初級テスト用
   - 短針・長針切替
   - 太陽・月選択
   - SVG針移動
========================================= */

import questions from "../data/tokei/tokei-shokyuu-data.js";

import chuukyuuData
    from "../data/tokei/tokei-chuukyuu-data.js";

import {saveScore, getScore} from "./storage.js";


/* =========================
レベル取得
========================= */
const params =
    new URLSearchParams(
    window.location.search
    );

const gameLevel =
    params.get("level") ||
    "beginner";


/* =========================
   DOM取得
========================= */
const shortNeedleBtn =
    document.querySelector(".short-needle");

const longNeedleBtn =
    document.querySelector(".long-needle");

const needleGuides =
    document.querySelectorAll(".needle-guide");

const shortGuide =
    needleGuides[0];

const longGuide =
    needleGuides[1];

const clockNumbers =
    document.querySelectorAll(".clock-number");

const shortHand =
    document.getElementById("short-hand");

const longHand =
    document.getElementById("long-hand");

const sunBtn =
    document.querySelector(".sun-btn");

const moonBtn =
    document.querySelector(".moon-btn");

const checkBtn =
    document.getElementById("check-btn");

const questionText =
    document.querySelector(".question-text");

const soundBtn =
    document.getElementById("sound-btn");

const remainingDisplay =
    document.getElementById("remaining-display");

const missDisplay =
    document.getElementById("miss-display");

const resultModal =
    document.getElementById("result-modal");

const gameLevelLabel =
    document.getElementById("game-level-label");

const dateTime =
    document.getElementById("date-time");

const missResult =
    document.getElementById("miss-result");

const finalTime =
    document.getElementById("final-time");

const wrongListArea =
    document.getElementById("wrong-list-area");

const timerDisplay =
    document.getElementById("timer-display");

const bestMessage =
    document.getElementById("best-message");

const bestDate =
    document.getElementById("best-date");

const bestMiss =
    document.getElementById("best-miss");

const bestTime =
    document.getElementById("best-time");


/* =========================
   正解音
========================= */
const correctSound =
    new Audio(
        "sounds/correct.mp3"
    );

correctSound.volume = 0.4;

/* =========================
   現在状態
========================= */
let selectedNeedle = "short";

let selectedPeriod = null;

let currentHour = 12;

let currentMinute = 0;

let gameQuestions = [];

let currentQuestionIndex = 0;

let currentQuestion = null;

let missCount = 0;

let timer = null;

let startTime = null;

let elapsedTime = 0;

let wrongAnswers = [];

/* =========================
   時読み
========================= */
const hourReadings = {
    1: "いちじ",
    2: "にじ",
    3: "さんじ",
    4: "よじ",
    5: "ごじ",
    6: "ろくじ",
    7: "しちじ",
    8: "八じ",
    9: "くじ",
    10: "じゅうじ",
    11: "じゅういちじ",
    12: "れいじ"
};

/* =========================
   分読み
========================= */
const minuteReadings = {
    0: "",
    5: "ごふん",
    10: "じゅっぷん",
    15: "じゅうごふん",
    20: "にじゅっぷん",
    25: "にじゅうごふん",
    30: "さんじゅっぷん",
    35: "さんじゅうごふん",
    40: "よんじゅっぷん",
    45: "よんじゅうごふん",
    50: "ごじゅっぷん",
    55: "ごじゅうごふん"
};


/* =========================
   問題文生成
========================= */
function createDisplayText(
    hour,
    minute,
    period
) {

    const amPm =
        getAmPm(
            period,
            hour
        ) === "ごぜん"
            ? "午前"
            : "午後";


    const displayHour =
        hour === 12
            ? 0
            : hour;


    /* =====================
       ○時ちょうど
    ===================== */
    if (minute === 0) {

        return `${amPm}${displayHour}時です`;
    }


    /* =====================
       ○時半
    ===================== */
    if (minute === 30) {

        return `${amPm}${displayHour}時半です`;
    }


    /* =====================
       ○時○分
    ===================== */
    return `${amPm}${displayHour}時${minute}分です`;
}

/* =========================
   読み上げ文生成
========================= */
function createSpeechText(
    hour,
    minute,
    period
) {

    const amPm =
        getAmPm(
            period,
            hour
        );


    const hourReading =
        hourReadings[hour];


    /* =====================
       ○時ちょうど
    ===================== */
    if (minute === 0) {

        return `${amPm} ${hourReading} です`;
    }


    /* =====================
       ○時半
    ===================== */
    if (minute === 30) {

        return `${amPm} ${hourReading} はん です`;
    }


    /* =====================
       ○時○分
    ===================== */
    const minuteReading =
        minuteReadings[minute];


    return `${amPm} ${hourReading} ${minuteReading} です`;
}

/* =========================
   読み上げ
========================= */
function speak(text, callback = null) {

    speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );

    utterance.lang = "ja-JP";

    utterance.rate = 0.9;

    utterance.pitch = 1.0;

    utterance.onend = () => {

        if (callback) {
            callback();
        }

    };

    speechSynthesis.speak(
        utterance
    );
}


// 初級データからランダム10問生成
function createGameQuestions() {

    const shuffled =
        [...questions].sort(
            () => Math.random() - 0.5
        );

    gameQuestions =
        shuffled.slice(0, 10);
}

/* =========================
   中級問題生成
========================= */
function generateChuukyuuQuestions() {

    const generated = [];


    for (
        let hour = 1;
        hour <= 12;
        hour++
    ) {

        for (
            const minute of
            chuukyuuData.minutes
        ) {

            for (
                const period of
                chuukyuuData.periods
            ) {

                generated.push({

                    hour,

                    minute,

                    period,

                    displayText:
                        createDisplayText(
                            hour,
                            minute,
                            period
                        ),

                    speechText:
                        createSpeechText(
                            hour,
                            minute,
                            period
                        )
                });
            }
        }
    }


    return generated;
}

/* =========================
   問題表示
========================= */
function showQuestion() {

    if (!timer) {
        startTimer();
    }

    currentQuestion =
        gameQuestions[currentQuestionIndex];

    questionText.textContent =
        currentQuestion.displayText;


    resetClock();       // 時計リセット
    speakQuestion();    // 自動読み上げ
    updateStatus();     // ステータス更新
}

/* =========================
   音声再生
========================= */
function speakQuestion() {

    if (!currentQuestion) return;

    const utterance =
        new SpeechSynthesisUtterance(
            currentQuestion.speechText
        );

    utterance.lang = "ja-JP";

    speechSynthesis.speak(
        utterance
    );
}

/* =========================
   音声ボタン
========================= */
soundBtn.addEventListener(
    "click",
    () => {

        speakQuestion();
    }
);

/* =========================
   数字→角度変換
========================= */
function getAngle(number) {

    return number * 30;
}


/* =========================
   午前午後判定
========================= */
function getAmPm(period, hour) {

    if (period === "sun") {

        if (hour >= 6 && hour <= 11) {

            return "ごぜん";

        } else {

            return "ごご";
        }
    }

    if (period === "moon") {

        if (hour >= 6 && hour <= 11) {

            return "ごご";

        } else {

            return "ごぜん";
        }
    }

    return "";
}

/* =========================
   短針移動
========================= */
function moveShortHand(number) {

    const angle =
        getAngle(number);

    shortHand.setAttribute(
        "transform",
        `rotate(${angle} 150 150)`
    );

    currentHour = number;
}


/* =========================
   長針移動
========================= */
function moveLongHand(number) {

    const angle =
        getAngle(number);

    longHand.setAttribute(
        "transform",
        `rotate(${angle} 150 150)`
    );

    currentMinute =
        number === 12
            ? 0
            : number * 5;
}


/* =========================
   針選択UI更新
========================= */
function updateNeedleUI() {

    shortNeedleBtn.classList.remove("selected");

    if (longNeedleBtn) {
        longNeedleBtn.classList.remove("selected");
    }
    shortGuide.classList.add("guide-hidden");

    if (longGuide) {
        longGuide.classList.add("guide-hidden");
    }

    if (selectedNeedle === "short") {

        shortNeedleBtn.classList.add("selected");

        shortGuide.classList.remove("guide-hidden");

    } else {

        longNeedleBtn.classList.add("selected");

        longGuide.classList.remove("guide-hidden");
    }
}


/* =========================
   太陽・月UI更新
========================= */
function updatePeriodUI() {

    sunBtn.classList.remove("selected");

    moonBtn.classList.remove("selected");


    if (selectedPeriod === "sun") {

        sunBtn.classList.add("selected");

    } else if (selectedPeriod === "moon") {

        moonBtn.classList.add("selected");
    }
}

/* =========================
    ステータス更新
========================= */
function updateStatus() {

    remainingDisplay.textContent =
        "のこり:"
        + (
            gameQuestions.length
             - currentQuestionIndex
        );

    missDisplay.textContent =
        `ミス:${missCount}`;

}

/* =========================
   短針ボタン
========================= */
shortNeedleBtn.addEventListener(
    "click",
    () => {

        selectedNeedle = "short";

        updateNeedleUI();
    }
);


/* =========================
   長針ボタン
========================= */
if (longNeedleBtn) {

    longNeedleBtn.addEventListener(
        "click",
        () => {

            selectedNeedle = "long";

            updateNeedleUI();
        }
    );
}

/* =========================
   太陽ボタン
========================= */
sunBtn.addEventListener(
    "click",
    () => {

        selectedPeriod = "sun";

        updatePeriodUI();
    }
);


/* =========================
   月ボタン
========================= */
moonBtn.addEventListener(
    "click",
    () => {

        selectedPeriod = "moon";

        updatePeriodUI();
    }
);

/* =========================
   問題読み上げ
========================= */
soundBtn.addEventListener(
    "click",
    () => {

        speak(
            currentQuestion.speechText
        );
    }
);

/* =========================
   時計数字クリック
========================= */
clockNumbers.forEach(number => {

    number.addEventListener(
        "click",
        () => {

            const clickedNumber =
                Number(
                    number.dataset.number
                );


            if (selectedNeedle === "short") {

                moveShortHand(clickedNumber);

                if (
                    gameLevel === "intermediate"
                ) {

                    selectedNeedle = "long";

                    updateNeedleUI();
                }

            } else {

                moveLongHand(clickedNumber);
            }
        }
    );
});


/* =========================
   かくにんボタン
========================= */
checkBtn.addEventListener(
    "click",
    () => {

        /* 多重クリック防止 */
        checkBtn.disabled = true;

        const result =
            checkAnswer();


        if (result) {

            speechSynthesis.cancel();

            correctSound.currentTime = 0;

            correctSound.play();

            setTimeout(() => {
                nextQuestion();
                checkBtn.disabled = false;
            }, 500);

        } else {

            missCount++;

            updateStatus();

            const amPm =
                getAmPm(
                    selectedPeriod,
                    currentHour
                );

            const hourReading =
                hourReadings[currentHour];

            const minuteReading =
                minuteReadings[currentMinute];

            const wrongText =
                minuteReading
                    ? `${amPm} ${hourReading} ${minuteReading}`
                    : `${amPm} ${hourReading}`; 

            // 間違えた回答を保存
            if (!wrongAnswers.includes(currentQuestion.displayText)) {
                wrongAnswers.push(currentQuestion.displayText);
            }

            /* =========================
                不正解音
            ========================= */
            const wrongSound =
                new Audio(
                    "sounds/wrong.mp3"
                );
            wrongSound.play();

            /* =========================
                間違えた回答を読み上げる
            ========================= */
            setTimeout(() => {

                speak(wrongText, () => {

                    checkBtn.disabled = false;

                });

            }, 600);
            /* =========================
            不正解時は短針へ戻す
            ========================= */
            selectedNeedle = "short";

            updateNeedleUI();

        }
    }
);

/* =========================
   正誤判定
========================= */
function checkAnswer() {

    const isCorrectHour =
        currentHour === currentQuestion.hour;

    const isCorrectMinute =
        currentMinute === currentQuestion.minute;

    const isCorrectPeriod =
        selectedPeriod === currentQuestion.period;


    return (
        isCorrectHour &&
        isCorrectMinute &&
        isCorrectPeriod
    );
}

/* =========================
    タイマー開始
========================= */
function startTimer() {

    startTime = Date.now();

    timer = setInterval(() => {
        elapsedTime =
            Date.now() - startTime;
        updateTimerDisplay();
    }, 10);

}

/* =========================
    タイマー表示更新
========================= */
function updateTimerDisplay() {

    const seconds =(elapsedTime / 1000).toFixed(2);

    timerDisplay.textContent = seconds;

}


/* =========================
    ベストスコア読込
========================= */
function loadBestScore() {

    const storageKey =
        gameLevel === "beginner"
            ? "tokei-beginner-best"
            : "tokei-intermediate-best";

    return JSON.parse(
        localStorage.getItem(
            storageKey
        )
    );

}


/* =========================
    結果モーダル表示
========================= */
function showResultModal() {

    clearInterval(timer);

    timer = null;

    const result = {
        time:
            Number(
                (
                    elapsedTime / 1000
                ).toFixed(2)
            ),
        miss:
            missCount,
        date:
            new Date()
                .toLocaleString("ja-JP")
    };

    const storageKey =
        gameLevel === "beginner"
            ? "beginner"
            : "intermediate";

    const isBest =
        saveScore(
            "tokei",
            storageKey,
            result
        );

    const bestScore =
        getScore(
            "tokei",
            storageKey
        );

    const now = new Date();
        dateTime.textContent = now.toLocaleString("ja-JP");

    gameLevelLabel.textContent =
        gameLevel === "beginner"
            ? "【しょきゅう（初級）】"
            : "【中級（ちゅうきゅう）】";

    missResult.textContent = `ミス:${missCount}`;

    finalTime.textContent = `タイム:${(elapsedTime / 1000).toFixed(2)}秒`;

    wrongListArea.innerHTML = "";

    if (isBest) {

        bestMessage.textContent =
            "🎉 ベストきろく　こうしん！";

        bestDate.textContent = "";
        bestMiss.textContent = "";
        bestTime.textContent = "";

    } else if (bestScore) {
        bestMessage.textContent = "";
        bestDate.textContent =
            `いつ：${bestScore.date}`;
        bestMiss.textContent =
            `ミス：${bestScore.miss}回`;
        bestTime.textContent =
            `タイム：${bestScore.time}秒`;
    }

    // 間違えた問題をリスト表示
    wrongAnswers.forEach(answer => {
        const p = document.createElement("p");
        p.textContent = answer;
        wrongListArea.appendChild(p);
    });

    document
        .getElementById("result-modal")
        .classList.remove("hidden");
}


/* =========================
   次問題へ
========================= */
function nextQuestion() {

    currentQuestionIndex++;

    if (
        currentQuestionIndex >=
        gameQuestions.length
    ) {
        showResultModal();
        return;
    }

    showQuestion();
    checkBtn.disabled = false;
}

/* =========================
   時計リセット
========================= */
function resetClock() {

    selectedNeedle = "short";

    selectedPeriod = null;

    currentHour = 12;

    currentMinute = 0;


    shortHand.setAttribute(
        "transform",
        "rotate(0 150 150)"
    );

    longHand.setAttribute(
        "transform",
        "rotate(0 150 150)"
    );


    updateNeedleUI();

    updatePeriodUI();
}

/* =========================
    レベル別UI
========================= */
function setupLevelUI() {

    if (gameLevel === "beginner") {

        if (longNeedleBtn) {

            longNeedleBtn
                .closest(".needle-row")
                .style.display = "none";
        }

    } else {

        if (longNeedleBtn) {

            longNeedleBtn
                .closest(".needle-row")
                .style.display = "flex";
        }
    }

}

/* =========================
    ゲーム再開
========================= */
function restartGame() {
    resultModal.classList.add("hidden");
    currentQuestionIndex = 0;
    missCount = 0;
    wrongAnswers = [];
    elapsedTime = 0;
    timerDisplay.textContent = "0.00";
    createGameQuestions();
    showQuestion();
    updateStatus();
}

/* =========================
    メニューへ戻る
========================= */
function goBack() {

    window.location.href =
        "tokei-index.html";
}

/* =========================
   初期化
========================= */
if (gameLevel === "beginner") {

    createGameQuestions();

} else {

    gameQuestions =
        generateChuukyuuQuestions()
            .sort(
                () => Math.random() - 0.5
            )
            .slice(0, 10);

}

showQuestion();

updateNeedleUI();

updatePeriodUI();

setupLevelUI();

updateStatus();

window.restartGame = restartGame;

window.goBack = goBack;