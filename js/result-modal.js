
/* =========================================
   File: result-modal.js
   Purpose: ゲーム結果モーダルの共通表示
   created: 2026/10/25 by yagi3
========================================= */

/**
 * 結果モーダルを表示する
 *
 * @param {Object} resultData - 結果表示用データ
 * @param {string} resultData.gameName - ゲーム名
 * @param {string} resultData.date - プレイ日時
 * @param {number} resultData.time - プレイ時間（秒）
 * @param {number} resultData.missCount - ミス回数
 * @param {boolean} resultData.bestUpdated - ベスト更新の有無
 * @param {Object|null} resultData.bestRecord - ベスト記録
 * @param {Array} resultData.wrongQuestions - 間違えた問題
 */
export function showResultModal(resultData) {
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

    const bestTime =
        document.getElementById("best-time");

    const bestMiss =
        document.getElementById("best-miss");

    const wrongListArea =
        document.getElementById("wrong-list");

    gameTypeLabel.textContent =
        `【${resultData.gameName}】`;

    dateTime.textContent =
        resultData.date;

    finalTime.textContent =
        `タイム：${resultData.time.toFixed(2)}秒`;

    missResult.textContent =
        `ミス：${resultData.missCount}回`;

    // ベスト記録
    if (resultData.bestUpdated) {
        bestMessage.textContent =
            "🎉 ベストきろく　こうしん！";

        bestDate.textContent = "";
        bestMiss.textContent = "";
        bestTime.textContent = "";
    } else {
        bestMessage.textContent = "";

        if (resultData.bestRecord) {
            bestDate.textContent =
                `いつ：${resultData.bestRecord.date}`;

            bestMiss.textContent =
                `ミス：${resultData.bestRecord.miss}回`;

            bestTime.textContent =
                `タイム：${resultData.bestRecord.time}秒`;
        } else {
            bestDate.textContent = "";
            bestMiss.textContent = "";
            bestTime.textContent = "";
        }
    }

    // 間違えた問題
    wrongListArea.replaceChildren();

    resultData.wrongQuestions.forEach(item => {
        const line = document.createElement("p");

        const question = document.createElement("div");
        question.textContent = `問題：${item.question}`;
        line.appendChild(question);

        if (item.answer) {
            const answer = document.createElement("div");
            answer.textContent = `正解：${item.answer}`;
            line.appendChild(answer);
        }

        if (item.detail) {
            const detail = document.createElement("div");
            detail.textContent = item.detail;
            line.appendChild(detail);
        }

        if (item.lesson !== undefined && item.lesson !== null) {
            const lesson = document.createElement("div");
            lesson.textContent = `レッスン：${item.lesson}`;
            line.appendChild(lesson);
        }

        wrongListArea.appendChild(line);
    });

    resultModal.classList.remove("hidden");
}
