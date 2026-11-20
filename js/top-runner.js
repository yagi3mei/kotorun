
/* =========================================
   File: top-runner.js
   Purpose: トップ画面のランナーアニメーションと音声
   Created: 2026-11-20：ランナーのアニメーションとクリック時の音声（シークレット機能）
========================================= */

// ランナー画像を取得
const runners = document.querySelectorAll(".top-runner");

// アニメーションのフレーム番号
let runnerFrame = 1;

// 500ミリ秒ごとに画像を切り替える
setInterval(() => {

    runnerFrame = runnerFrame === 1 ? 2 : 1;

    const runnerImage =
        `images/badges/runner/runner_0${runnerFrame}.png`;

    // すべてのランナーの画像を切り替える
    runners.forEach(runner => {
        runner.src = runnerImage;
    });

}, 500);


// ランナーをクリックしたときの音声
runners.forEach(runner => {

    runner.addEventListener("click", () => {

        // 前の発話が残っていたら停止
        speechSynthesis.cancel();

        // クリックしたランナーに応じて言葉を決める
        const message = runner.classList.contains("upper-runner")
            ? "メニューをえらんでね"
            : "がんばって";

        // 音声を作成
        const speech = new SpeechSynthesisUtterance(message);

        // 日本語で発音
        speech.lang = "ja-JP";

        // 少しゆっくり話す
        speech.rate = 0.9;

        // 発話
        speechSynthesis.speak(speech);

    });

});
