/* =========================================
   File: tokei-test.js
   Purpose: 時計ゲーム UIテスト
   Author: やぎさん
   Created: 2026-05-24

   Notes:
   - 針選択
   - ガイド表示
   - 時計数字クリック
   - SVG針回転
========================================= */


/* =========================
   現在選択中の針
========================= */
let currentNeedle = "short";


/* =========================
   要素取得
========================= */
const shortBtn =
    document.querySelector(".short-needle");

const longBtn =
    document.querySelector(".long-needle");

const guides =
    document.querySelectorAll(".needle-guide");


/* =========================
   SVG針取得
========================= */
const shortHand =
    document.getElementById("short-hand");

const longHand =
    document.getElementById("long-hand");


/* =========================
   数字取得
========================= */
const clockNumbers =
    document.querySelectorAll(".clock-number");

    
/* =========================
   太陽・月
========================= */
const sunBtn =
    document.querySelector(".sun-btn");

const moonBtn =
    document.querySelector(".moon-btn");


/* =========================
   昼夜選択
========================= */
function selectDayNight(type) {

    sunBtn.classList.remove("selected");
    moonBtn.classList.remove("selected");

    if (type === "sun") {

        sunBtn.classList.add("selected");

    } else {

        moonBtn.classList.add("selected");

    }
}


/* =========================
   イベント
========================= */
sunBtn.addEventListener("click", () => {

    selectDayNight("sun");

});

moonBtn.addEventListener("click", () => {

    selectDayNight("moon");

});


/* =========================
   針選択切替
========================= */
function selectNeedle(type) {

    currentNeedle = type;

    /* ボタンselected解除 */
    shortBtn.classList.remove("selected");
    longBtn.classList.remove("selected");

    /* ガイド非表示 */
    guides.forEach(guide => {

        guide.classList.add("guide-hidden");

    });

    /* 選択反映 */
    if (type === "short") {

        shortBtn.classList.add("selected");

        guides[0].classList.remove("guide-hidden");

    } else {

        longBtn.classList.add("selected");

        guides[1].classList.remove("guide-hidden");

    }
}


/* =========================
   ボタンイベント
========================= */
shortBtn.addEventListener("click", () => {

    selectNeedle("short");

});

longBtn.addEventListener("click", () => {

    selectNeedle("long");

});


/* =========================
   数字クリック
========================= */
clockNumbers.forEach(number => {

    number.addEventListener("click", () => {

        const value =
            parseInt(number.dataset.number);

        moveNeedle(value);

    });

});


/* =========================
   針移動
========================= */
function moveNeedle(number) {

    /* 12を0扱い */
    const normalized =
        number === 12 ? 0 : number;

    /* 30度ずつ回転 */
    const angle =
        normalized * 30;

    if (currentNeedle === "short") {

        shortHand.setAttribute(
            "transform",
            `rotate(${angle} 150 150)`
        );

    } else {

        longHand.setAttribute(
            "transform",
            `rotate(${angle} 150 150)`
        );

    }
}


/* =========================
   初期状態
========================= */
selectNeedle("short");
