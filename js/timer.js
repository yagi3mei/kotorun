
/* =========================================
   File: timer.js
   Purpose: 全ゲーム共通のタイマー処理
========================================= */

// タイマーの状態
let startTime = null;
let timerInterval = null;
let timerDisplayElement = null;
let stoppedTime = null;

// 画面更新間隔（50ms）
const TIMER_UPDATE_INTERVAL = 50;

/* =========================================
   タイマー開始
========================================= */
export function startTimer(timerDisplay) {

    // 前回のタイマーが動作中なら停止する
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // 表示要素を保持
    timerDisplayElement = timerDisplay;

    // 新しい計測を開始
    startTime = performance.now();
    stoppedTime = null;

    // 表示をリセット
    timerDisplayElement.textContent = "0.00";

    // 50ms間隔で表示を更新
    timerInterval = setInterval(() => {

        const elapsedTime =
            (performance.now() - startTime) / 1000;

        timerDisplayElement.textContent =
            elapsedTime.toFixed(2);

    }, TIMER_UPDATE_INTERVAL);
}

/* =========================================
   タイマー停止
========================================= */
export function stopTimer() {

    // すでに停止している場合は前回の値を返す
    if (stoppedTime !== null) {
        return stoppedTime;
    }

    // タイマーが開始されていない場合
    if (startTime === null) {
        return 0;
    }

    // 表示更新を停止
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // 実際の終了時刻を取得
    const endTime = performance.now();

    // 実際の経過時間を計算し、小数点以下2桁に丸める
    stoppedTime =
        Number(((endTime - startTime) / 1000).toFixed(2));

    // 画面表示を最終的な時間に更新
    timerDisplayElement.textContent =
        stoppedTime.toFixed(2);

    return stoppedTime;
}
