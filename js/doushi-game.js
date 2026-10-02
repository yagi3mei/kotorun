
import verbChoiceData from "../data/verb/verb-choice-data.js";
import { saveScore, getScore } from "../js/storage.js";

// =====================================
// URLパラメータ
// =====================================

const params = new URLSearchParams(location.search);

const mode = params.get("mode") || "normal";
const kana = params.get("kana") || "a";

// ファイル名に使える文字を確認
const validKana = /^[a-z]+$/;

if (!validKana.test(kana)) {
    throw new Error("不正な文字が指定されています。");
}

// =====================================
// 動詞データの読み込み
// =====================================

const verbModule = await import(
    `../data/verb/verb-data_${kana}.js`
);

const verbData = verbModule.default;

// =====================================
// 出題する活用形
// =====================================

const questionTypes = [
    "dictionary",
    "te",
    "ta",
    "nai",
    "tara",
    "tari"
];

// =====================================
// 出題リスト作成
// =====================================

// 動詞と活用形の組み合わせを問題にする
let questionList = [];

verbData.forEach((verb, verbIndex) => {
    questionTypes.forEach((type) => {
        questionList.push({
            verbIndex: verbIndex,
            questionType: type
        });
    });
});

// ランダムモードでは全問題をシャッフル
if (mode === "random") {
    questionList.sort(() => Math.random() - 0.5);
}

// =====================================
// 現在の問題
// =====================================

let currentQuestionIndex = 0;

let currentVerbIndex = 0;
let questionTypeIndex = 0;
let questionType = questionTypes[questionTypeIndex];

let verb = verbData[currentVerbIndex];
let currentQuestion = verb[questionType];


const questionNames = {
    te: {
        display: "て形は？",
        speech: "てけいは"
    },
    ta: {
        display: "た形は？",
        speech: "たけいは"
    },
    dictionary: {
        display: "辞書（じしょ）形は？",
        speech: "じしょけいは"
    },
    nai: {
        display: "ない形は？",
        speech: "ないけいは"
    },
    tara: {
        display: "たら形は？",
        speech: "たらけいは"
    },
    tari: {
        display: "たり形は？",
        speech: "たりけいは"
    },
};

let missCount = 0;
let wrongQuestions = [];
let isAnswerLocked = false;
let startTime;
let timerInterval;

const resultModal =
    document.getElementById("result-modal");

const gameTypeLabel =
    document.getElementById("game-type-label");

const dateTime =
    document.getElementById("date-time");

const finalTime =
    document.getElementById("final-time");

const missResult =
    document.getElementById("miss-result");

const bestMessage =
    document.getElementById("best-message");

const bestDate =
    document.getElementById("best-date");

const bestMiss =
    document.getElementById("best-miss");

const bestTime =
    document.getElementById("best-time");

const wrongListArea =
    document.getElementById("wrong-list");

const missDisplay =
    document.getElementById("miss-display");

const answerDisplay =
    document.getElementById("answer-display");

const timerDisplay =
    document.getElementById("timer-display");


// =====================================
// 設問を表示する関数
// =====================================

function showQuestion() {

    isAnswerLocked = false;

    answerDisplay.textContent = "";

    // ---------------------------------
    // 現在の動詞・問題を取得
    // ---------------------------------
    const currentItem = questionList[currentQuestionIndex];

    currentVerbIndex = currentItem.verbIndex;
    questionType = currentItem.questionType;

    verb = verbData[currentVerbIndex];
    currentQuestion = verb[questionType];

    questionTypeIndex = questionTypes.indexOf(questionType);

    document.getElementById("remaining-display").textContent =
        `のこり：${questionList.length - currentQuestionIndex}`;


    // =================================
    // 設問文
    // =================================

    const sentenceArea =
        document.querySelector(".sentence-area");

    // question1～3 の中から、
    // masu と同じ文字列を探す
    const questionParts = [
        verb.question1,
        verb.question2,
        verb.question3
    ];

    sentenceArea.innerHTML = `
        <span class="sentence-part1">
            ${questionParts[0] === verb.masu
                ? `<span class="verb-blue">${questionParts[0]}</span>`
                : questionParts[0]}
        </span>

        <span class="sentence-part2">
            ${questionParts[1] === verb.masu
                ? `<span class="verb-blue">${questionParts[1]}</span>`
                : questionParts[1]}
        </span>

        <button id="sentence-sound-btn">🔊</button>

        <span class="sentence-reading">
            ${questionParts[2] === verb.masu
                ? `<span class="verb-blue">${questionParts[2]}</span>`
                : questionParts[2]}
        </span>

        <span class="sentence-part3"></span>
    `;


    // =================================
    // 音声再生ボタン　設問文
    // =================================

    const sentenceSoundBtn =
        document.getElementById("sentence-sound-btn");

    sentenceSoundBtn.addEventListener("click", () => {

        const utterance =
            new SpeechSynthesisUtterance(
                verb.questionSpeech
            );

        utterance.lang = "ja-JP";

        speechSynthesis.speak(utterance);

    });


    // =================================
    // イラスト
    // =================================

    const verbImage =
        document.getElementById("verbImage");

    verbImage.src =
        `images/verb/${verb.image}`;

    verbImage.alt =
        verb.question1 + verb.question2;


    // =================================
    // 設問
    // =================================

    const questionText =
        document.getElementById("questionText");

    questionText.textContent =
        questionNames[questionType].display;


    // =================================
    // 選択肢
    // =================================

    const wrongChoices =
        verbChoiceData[questionType]
            .filter(
                choice =>
                    choice !== currentQuestion.answer
            )
            .sort(
                () => Math.random() - 0.5
            )
            .slice(0, 3);

    const choices = [
        currentQuestion.answer,
        ...wrongChoices
    ];

    choices.sort(
        () => Math.random() - 0.5
    );


    const choicesContainer =
        document.getElementById("choicesContainer");

    choicesContainer.innerHTML = "";


    choices.forEach(choice => {

        const button =
            document.createElement("button");

        button.className = "choice-button";
        button.textContent = choice;

        choicesContainer.appendChild(button);


        // =================================
        // 選択肢クリック
        // =================================

        button.addEventListener("click", () => {

            // 連打防止
            if (isAnswerLocked) {
                return;
            }


            // ---------------------------------
            // 正解
            // ---------------------------------

            if (choice === currentQuestion.answer) {

                isAnswerLocked = true;
                
                button.classList.add("correct");

                answerDisplay.textContent =
                    currentQuestion.display;

                const utterance =
                    new SpeechSynthesisUtterance(
                        currentQuestion.speech
                    );

                utterance.lang = "ja-JP";

                                utterance.onend = () => {

                    // 次の問題へ
                    currentQuestionIndex++;

                    // 全問題が終了したら結果を表示
                    if (currentQuestionIndex >= questionList.length) {
                        showResult();
                        return;
                    }

                    showQuestion();
                };

                // utterance.onend = () => {

                //     // 次の活用形へ
                //     if (questionTypeIndex < questionTypes.length - 1) {

                    //     questionTypeIndex++;

                    // } else {

                    //     // 5種類終わったら次の動詞へ
                    //     questionTypeIndex = 0;
                    //     currentVerbIndex++;

                    // }

                    // // すべての動詞が終わったら終了
                    // if (currentVerbIndex >= verbDataA.length) {

                    //     showResult();

                    //     return;
                    // }

                    // showQuestion();

                // };

                speechSynthesis.speak(utterance);

            // ---------------------------------
            // 不正解
            // ---------------------------------

            } else {

                isAnswerLocked = true;

                // シェイク
                button.style.animation =
                    "shake 0.2s";

                setTimeout(() => {

                    button.style.animation = "";

                }, 200);


                // 不正解音
                const wrongSound =
                    document.getElementById(
                        "sound-wrong"
                    );

                wrongSound.volume = 0.3;

                wrongSound.currentTime = 0;

                wrongSound.play();


                // ミス数
                missCount++;

                missDisplay.textContent =
                    "ミス：" + missCount;

                // 間違えた問題を記録
                const wrongQuestion = {
                    masu: verb.masu,
                    form: questionNames[questionType].display.replace("は？", ""),
                    answer: currentQuestion.display
                };

                if (
                    !wrongQuestions.some(
                        item =>
                            item.masu === wrongQuestion.masu &&
                            item.form === wrongQuestion.form
                    )
                ) {
                    wrongQuestions.push(wrongQuestion);
                }

                // 音声終了後に再び回答可能
                wrongSound.onended = () => {

                    isAnswerLocked = false;

                };

            }

        });

    });

}


// =====================================
// モーダルを表示する関数
// =====================================
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
            `doushi_${mode}`,
            kana
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
        `doushi_${mode}`,
        kana,
        {
            time: Number(time),
            miss: missCount,
            date: dateStr
        }
    );


    /* =====================
       保存後のベスト取得
    ===================== */
    const best =
        getScore(
            `doushi_${mode}`,
            kana
        );


    /* =====================
       ゲーム情報
    ===================== */
    const kanaLabels = {
        a: "あ", i: "い", u: "う", e: "え", o: "お",
        ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
        sa: "さ", shi: "し", su: "す", se: "せ", so: "そ",
        ta: "た", chi: "ち", tsu: "つ", te: "て", to: "と",
        na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
        ha: "は", hi: "ひ", fu: "ふ", he: "へ", ho: "ほ",
        ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
        ya: "や", yu: "ゆ", yo: "よ",
        ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
        wa: "わ", wo: "を"
    };

    gameTypeLabel.textContent =
        `【${kanaLabels[kana] || kana} で はじまる どうし】`;

    dateTime.textContent =
        dateStr;


    /* =====================
       今回結果
    ===================== */
    finalTime.textContent =
        `タイム：${time}秒`;

    missResult.textContent =
        `ミス：${missCount}回`;


    /* =====================
       ベスト表示
    ===================== */
    if (isBest) {

        bestMessage.textContent =
            "🎉 ベストきろく　こうしん！";

        bestDate.textContent =
            "";

        bestMiss.textContent =
            "";

        bestTime.textContent =
            "";

    } else {

        bestMessage.textContent =
            "";

        bestDate.textContent =
            `いつ：${best.date}`;

        bestMiss.textContent =
            `ミス：${best.miss}回`;

        bestTime.textContent =
            `タイム：${best.time}秒`;

    }


    /* =====================
       間違えた問題
    ===================== */
    let wrongList = "";

    wrongQuestions.forEach(item => {

        wrongList +=
            `${item.masu} → ${item.form}<br>${item.answer}<br><br>`;

    });

    wrongListArea.innerHTML =
        wrongList;


    resultModal.classList.remove(
        "hidden"
    );
}

// =====================================
// 音声再生ボタン　設問
// =====================================

const soundBtn =
    document.getElementById("sound-btn");

soundBtn.addEventListener("click", () => {

    const utterance =
        new SpeechSynthesisUtterance(
            questionNames[questionType].speech
        );

    utterance.lang = "ja-JP";

    speechSynthesis.speak(utterance);

});


// =====================================
// 最初の問題を表示
// =====================================

startTime = performance.now();

clearInterval(timerInterval);

timerInterval =
    setInterval(() => {

        timerDisplay.textContent =
            (
                (performance.now()
                - startTime)
                / 1000
            ).toFixed(2);

    }, 50);

showQuestion();


/* =========================
   クリックイベント
========================= */
window.goBack = function () {
    location.href = "doushi-subindex.html";
};

// もういちど：現在のモード・文字のままゲームを再読み込み
window.restartGame = function () {
    location.reload();
};

// メニューへ：動詞活用ゲームの文字選択画面へ戻る
window.goMenu = function () {
    location.href = "doushi-subindex.html";
};


// =====================================
// 確認用
// =====================================
console.log("読み込んだ動詞データ：", verb);
console.log("モード：", mode);
console.log("選択した文字：", kana);
console.log("読み込んだ動詞データ：", verbData);
console.log("現在の問題：", currentQuestion);
console.log("出題数：", questionList.length);

