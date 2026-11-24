/* =========================================
   File: status.js
   Purpose: 全ゲーム共通のステータス表示
========================================= */

/* =========================
   残り問題数の表示
========================= */
export function updateRemainingDisplay(remainingDisplay, remainingCount) {

    remainingDisplay.textContent =
        "のこり：" + remainingCount;

}


/* =========================
   ミス数の表示
========================= */
export function updateMissDisplay(missDisplay, missCount) {

    missDisplay.textContent =
        "ミス：" + missCount;

}