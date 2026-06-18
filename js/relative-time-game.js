/* =========================================
   File: relative-time-game.js
   Purpose: ひづけゲーム
   Author: やぎさん
   Created: 2026-06-13

   Notes:
   - mode取得
   - 問題データ取得
   - 問題表示
========================================= */

/* =========================
   データ
========================= */
import {
    dayData,
    weekData,
    monthData,
    yearData,
    allRelativeTimeData
}
from "../data/calendar/relative-time-data.js";


// localStorage管理
import {
    saveScore,
    getScore
}
from "./storage.js";


/* =========================
   URLパラメータ
========================= */
const params =
    new URLSearchParams(
        location.search
    );

const mode =
    params.get("mode") || "day";


/* =========================
   不正解音声
========================= */
const wrongSound =
    document.getElementById(
        "sound-wrong"
    );


/* =========================
   結果モーダル
========================= */

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

const wrongListArea =
    document.getElementById(
        "wrong-list-area"
    );

const timerDisplay =
    document.getElementById(
        "timer-display"
    );


/* =========================
   モード別データ
========================= */
let gameData = [];

switch (mode) {

    case "day":
        gameData = dayData;
        break;

    case "week":
        gameData = weekData;
        break;

    case "month":
        gameData = monthData;
        break;

    case "year":
        gameData = yearData;
        break;

    case "random":
        gameData = allRelativeTimeData;
        break;

    default:
        gameData = dayData;

}


/* =========================
   問題管理
========================= */
let questions = [];

let currentQuestionIndex = 0;

let missCount = 0;

let wrongAnswers = [];


/* =========================
   タイマー
========================= */
let timer = null;

let startTime = null;

let elapsedTime = 0;


/* =========================
   確認
========================= */
console.log(
    "gameData:",
    gameData
);


/* =========================
   問題生成
========================= */
function createQuestions() {

    if (mode === "day") {

        const firstQuestion =
            dayData.find(
                item => item.offset === 0
            );

        const others =
            dayData
                .filter(
                    item => item.offset !== 0
                )
                .sort(
                    () => Math.random() - 0.5
                );

        questions = [
            firstQuestion,
            ...others
        ];

        return;
    }

    if (mode === "week") {

        const firstQuestion =
            weekData.find(
                item => item.offset === 0
            );

        const others =
            weekData
                .filter(
                    item => item.offset !== 0
                )
                .sort(
                    () => Math.random() - 0.5
                );

        questions = [
            firstQuestion,
            ...others
        ];

        return;
    }

    if (mode === "month") {

        const firstQuestion =
            monthData.find(
                item => item.offset === 0
            );

        const others =
            monthData
                .filter(
                    item => item.offset !== 0
                )
                .sort(
                    () => Math.random() - 0.5
                );

        questions = [
            firstQuestion,
            ...others
        ];

        return;
    }

    if (mode === "year") {

        const firstQuestion =
            yearData.find(
                item => item.offset === 0
            );

        const others =
            yearData
                .filter(
                    item => item.offset !== 0
                )
                .sort(
                    () => Math.random() - 0.5
                );

        questions = [
            firstQuestion,
            ...others
        ];

        return;
    }

    if (mode === "random") {

        const shuffled =
            [...allRelativeTimeData]
                .sort(
                    () => Math.random() - 0.5
                );

        questions =
            shuffled.slice(0, 5);

    }

}


/* =========================
   問題表示
========================= */
function showQuestion() {

    /* 初回のみタイマー開始 */
    if (!timer) {

        startTimer();

    }

    const question =
        questions[
            currentQuestionIndex
        ];

    if (!question) {
        return;
    }

    document.getElementById(
        "question-display"
    ).textContent =
        question.reading;
    
    speakQuestion(question);

}


/* =========================
   タイマー開始
========================= */
function startTimer() {

    startTime =
        Date.now();

    timer =
        setInterval(
            () => {

                elapsedTime =
                    Date.now() - startTime;

                updateTimerDisplay();

            },
            10
        );

}


/* =========================
   タイマー表示更新
========================= */
function updateTimerDisplay() {

    const seconds =
        (
            elapsedTime / 1000
        ).toFixed(2);

    timerDisplay.textContent =
        seconds;

}


/* =========================
   結果モーダル表示
========================= */
function showResultModal() {

    /* タイマー停止 */
    clearInterval(timer);
    timer = null;

    // スコア保存
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

    const isBest =
    saveScore(
        "hizuke",
        mode,
        result
    );

    const bestScore =
    getScore(
        "hizuke",
        mode
    );

    // 現在日時
    const now =
        new Date();

    dateTime.textContent =
        now.toLocaleString("ja-JP");


    // ミス表示
    missResult.textContent =
        `ミス：${missCount}`;

    // タイム表示
    finalTime.textContent =
        `タイム：${(elapsedTime / 1000).toFixed(2)}秒`;
        
        if (isBest) {

        bestMessage.textContent =
            "🎉 ベストきろく　こうしん！";

        bestDate.textContent = "";

        bestMiss.textContent = "";

        bestTime.textContent = "";

    } else if (bestScore) {

        bestMessage.textContent =
            "";

        bestDate.textContent =
            `いつ：${bestScore.date}`;

        bestMiss.textContent =
            `ミス：${bestScore.miss}回`;

        bestTime.textContent =
            `タイム：${bestScore.time}秒`;
    }


    // 間違えた問題表示
    wrongListArea.innerHTML = "";

    wrongAnswers.forEach(answer => {

        const p =
            document.createElement("p");

        p.textContent =
            answer;

        wrongListArea.appendChild(p);

    });


    // モーダル表示
    resultModal.classList.remove(
        "hidden"
    );

}


/* =========================
   次の問題へ
========================= */
function nextQuestion() {

    currentQuestionIndex++;

    updateRemainingDisplay();

    if (currentQuestionIndex >= questions.length) {

        showResultModal();

        return;

}

    showQuestion();

}


/* =========================
   正解日付取得
========================= */
function getAnswerDate() {

    const question =
        questions[
            currentQuestionIndex
        ];

    const today =
        new Date();

    const answerDate =
        new Date(today);

    answerDate.setDate(
        today.getDate()
        + question.offset
    );

    return answerDate
        .toISOString()
        .split("T")[0];

}


/* =========================
   week 正解週取得
========================= */
function getWeekAnswer() {

    const question =
        questions[
            currentQuestionIndex
        ];


    const today =
        new Date();


    /* 今週の日曜日 */
    const answerWeek =
        new Date(today);

    answerWeek.setDate(
        today.getDate()
        - today.getDay()
        + (question.offset * 7)
    );


    return answerWeek
        .toISOString()
        .split("T")[0];

}


/* =========================
   日付読み上げ
========================= */
function speakDate(question, dateString) {

    speechSynthesis.cancel();

    const date =
        new Date(dateString);

    const month =
        date.getMonth() + 1;

    const day =
        date.getDate();

    const text =
        `${question.speech}は ${month}月 ${day}日です`;

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = "ja-JP";

    /* 読み上げ終了後 */
    utterance.onend = () => {

        nextQuestion();

    };

    speechSynthesis.speak(utterance);

}


/* =========================
   週読み上げ
========================= */
function speakWeek(question) {

    const text =
        `${question.speech}です`;

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = "ja-JP";

    utterance.onend = () => {

        nextQuestion();

    };

    speechSynthesis.speak(
        utterance
    );

}


/* =========================
   問題読み上げ
========================= */
function speakQuestion(question) {

    speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            question.speech
        );

    utterance.lang = "ja-JP";

    speechSynthesis.speak(utterance);

}


/* =========================
   dayモード カレンダー生成
========================= */
if (mode === "day") {

    renderDayCalendar();

}


if (mode === "week") {

    renderWeekButtons();

}


/* =========================
   3週間カレンダー生成
========================= */
function renderDayCalendar() {

    const gameArea =
        document.getElementById(
            "game-area"
        );

    const today =
        new Date();

    const dayOfWeek =
        today.getDay();

    // 今週の日曜日
    const currentSunday =
        new Date(today);

    currentSunday.setDate(
        today.getDate() - dayOfWeek
    );

    // 前週の日曜日
    const startDate =
        new Date(currentSunday);

    startDate.setDate(
        currentSunday.getDate() - 7
    );

    let html = "";

    /* 曜日 */

    html += `
        <div class="calendar-weekdays">

            <div class="weekday sunday">日</div>
            <div>月</div>
            <div>火</div>
            <div>水</div>
            <div>木</div>
            <div>金</div>
            <div class="weekday saturday">土</div>

        </div>
    `;

    /* 21日 */

    html += `
        <div class="calendar-grid">
    `;

    for (
        let i = 0;
        i < 21;
        i++
    ) {

        const date =
            new Date(startDate);

        date.setDate(
            startDate.getDate() + i
        );

        const month =
            date.getMonth() + 1;

        const day =
            date.getDate();

        const fullDate =
            date.toISOString()
                .split("T")[0];

        html += `
            <button
                class="date-btn"
                data-date="${fullDate}">

                ${month}/${day}

            </button>
        `;
    }

    html += `
        </div>
    `;

    gameArea.classList.add(
        "week-mode"
    );

    gameArea.innerHTML = html;

        
    /* =========================
        日付ボタンクリック
    ========================= */
    document
        .querySelectorAll(".date-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const clickedDate =
                        button.dataset.date;

                    const answerDate =
                        getAnswerDate();

                    if (clickedDate === answerDate) {

                        const question =
                            questions[currentQuestionIndex];


                        /* 今日だけ緑表示 */
                        if (question.offset === 0) {

                            button.classList.add(
                                "today-correct"
                            );

                        }


                        /* 正解した日付を読み上げ */
                        speakDate(
                            question,
                            answerDate
                        );

                        console.log("正解");

                    } else {

                        speechSynthesis.cancel();
                        
                        console.log("不正解");

                        missCount++;

                        updateMissDisplay();


                        /* =========================
                        間違えた問題を保存
                        ========================= */

                        const question =
                            questions[currentQuestionIndex];


                        if (
                            !wrongAnswers.includes(
                                question.reading
                            )
                        ) {

                            wrongAnswers.push(
                                question.reading
                            );

                        }


                        /* =========================
                        不正解音
                        ========================= */

                        wrongSound.currentTime = 0;

                        wrongSound.play();
                        
                    }
                }
            );
        });

}


/* =========================
   6週間表示生成
========================= */
function renderWeekButtons() {

    const gameArea =
        document.getElementById(
            "game-area"
        );


    /* 今日 */
    const today =
        new Date();


    /* 今週の日曜日 */
    const currentSunday =
        new Date(today);

    currentSunday.setDate(
        today.getDate()
        - today.getDay()
    );


    /* =========================
       表示開始位置決定
       0：対象外が上
       1：対象外が下
    ========================= */

    const pattern =
        Math.random() < 0.5
            ? 0
            : 1;


    let startWeek;


    /* -------------------------
       対象外が上
       -3週～+2週
    ------------------------- */
    if (pattern === 0) {

        startWeek =
            new Date(currentSunday);

        startWeek.setDate(
            currentSunday.getDate()
            - 21
        );

    } else {

        /* ---------------------
           対象外が下
           -2週～+3週
        --------------------- */

        startWeek =
            new Date(currentSunday);

        startWeek.setDate(
            currentSunday.getDate()
            - 14
        );

    }


    let html = "";


    /* =========================
       6週間生成
    ========================= */
    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const weekStart =
            new Date(startWeek);

        weekStart.setDate(
            startWeek.getDate()
            + (i * 7)
        );


        const weekEnd =
            new Date(weekStart);

        weekEnd.setDate(
            weekStart.getDate()
            + 6
        );


        const startMonth =
            weekStart.getMonth() + 1;

        const startDay =
            weekStart.getDate();


        const endMonth =
            weekEnd.getMonth() + 1;

        const endDay =
            weekEnd.getDate();


        /* 判定用の日曜日 */
        const fullDate =
            weekStart
                .toISOString()
                .split("T")[0];


        html += `
            <button
                class="week-btn"
                data-week="${fullDate}">

                ${startMonth}/${startDay}
                〜
                ${endMonth}/${endDay}

            </button>
        `;

    }


    gameArea.innerHTML =
        html;

    /* =========================
        週ボタンクリック
    ========================= */
    document
        .querySelectorAll(".week-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const clickedWeek =
                        button.dataset.week;

                    const answerWeek =
                        getWeekAnswer();


                    /* =========================
                        正解
                    ========================= */

                    if (
                        clickedWeek === answerWeek
                    ) {

                        const question =
                            questions[currentQuestionIndex];


                        /* 正解読み上げ */
                        speakWeek(
                            question
                        );


                        console.log(
                            "正解"
                        );


                    } else {


                        /* =========================
                            不正解
                        ========================= */

                        console.log(
                            "不正解"
                        );


                        missCount++;


                        updateMissDisplay();


                        /* 間違えた問題保存 */

                        const question =
                            questions[currentQuestionIndex];


                        if (
                            !wrongAnswers.includes(
                                question.reading
                            )
                        ) {

                            wrongAnswers.push(
                                question.reading
                            );

                        }


                        /* 不正解音 */

                        speechSynthesis.cancel();

                        wrongSound.currentTime = 0;

                        wrongSound.play();

                    }

                }
            );

        });

}

/* =========================
   残り問題数表示
========================= */
function updateRemainingDisplay() {

    const remaining =
        questions.length
        - currentQuestionIndex;

    document.getElementById(
        "remaining-display"
    ).textContent =
        `のこり：${remaining}`;

}


/* =========================
   ミス数表示
========================= */
function updateMissDisplay() {

    document.getElementById(
        "miss-display"
    ).textContent =
        `ミス：${missCount}`;

}


/* =========================
   ゲーム再開
========================= */
function restartGame() {

    resultModal.classList.add(
        "hidden"
    );

    document
    .querySelectorAll(".date-btn")
    .forEach(button => {

        button.classList.remove(
            "today-correct"
        );

    });

    currentQuestionIndex = 0;

    missCount = 0;

    wrongAnswers = [];

    elapsedTime = 0;

    timerDisplay.textContent =
        "0.00";


    createQuestions();

    updateRemainingDisplay();

    updateMissDisplay();

    showQuestion();

}


/* =========================
   メニューへ戻る
========================= */
function goMenu() {

    window.location.href =
        "hizuke-index.html";

}


/* =========================
   初期化
========================= */
updateMissDisplay();

createQuestions();

updateRemainingDisplay();

showQuestion();

console.log(
    "mode:",
    mode
);

console.log(
    "questions:",
    questions
);


console.log(
    "weekAnswer:",
    getWeekAnswer()
);

window.restartGame =
    restartGame;

window.goMenu =
    goMenu;