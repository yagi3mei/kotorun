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

import questions from "../../data/tokei/tokei-shokyuu-data.js";

import chuukyuuData
    from "../../data/tokei/tokei-chuukyuu-data.js";

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

/* =========================
   正解音
========================= */
const correctSound =
    new Audio(
        "/sounds/correct.mp3"
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
    8: "はちじ",
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
function speak(text) {

    speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );

    utterance.lang = "ja-JP";

    utterance.rate = 0.9;

    utterance.pitch = 1.0;

    speechSynthesis.speak(
        utterance
    );
}

/* =========================
   ランダム10問生成
========================= */
// 中級問題からランダム10問生成
function createGameQuestions() {

    gameQuestions =
        generateChuukyuuQuestions()
            .sort(
                () => Math.random() - 0.5
            )
            .slice(0, 10);
}
// 初級データからランダム10問生成
// function createGameQuestions() {

//     const shuffled =
//         [...questions].sort(
//             () => Math.random() - 0.5
//         );

//     gameQuestions =
//         shuffled.slice(0, 10);
// }

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

    currentQuestion =
        gameQuestions[currentQuestionIndex];

    questionText.textContent =
        currentQuestion.displayText;


    resetClock();
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

                moveShortHand(
                    clickedNumber
                );

            } else {

                moveLongHand(
                    clickedNumber
                );
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

        const result =
            checkAnswer();


        if (result) {

            speechSynthesis.cancel();

            correctSound.currentTime = 0;

            correctSound.play();

            setTimeout(() => {

                nextQuestion();

            }, 500);

        } else {

            missCount++;

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
                    ? `${amPm} ${hourReading} ${minuteReading} です`
                    : `${amPm} ${hourReading} です`; 
                                   
            // const wrongText =
            //     `${amPm} ${hourReading} です`;

            speak(wrongText);

            alert(wrongText);
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
   次問題へ
========================= */
function nextQuestion() {

    currentQuestionIndex++;


    if (
        currentQuestionIndex >=
        gameQuestions.length
    ) {

        alert(
            `ゲーム終了！\nミス:${missCount}`
        );

        return;
    }


    showQuestion();
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
   初期化
========================= */
createGameQuestions();

showQuestion();

updateNeedleUI();

updatePeriodUI();