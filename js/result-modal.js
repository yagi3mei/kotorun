
/* =========================================
   File: result-modal.js
   Purpose: ゲーム結果モーダルの共通表示
   created: 2026/10/25 by yagi3
   updated: 2026/11/12 html構造変更に対応
========================================= */

// モーダルの要素を保持
let resultModal = null;

// 各ゲームから受け取るボタン処理
let modalCallbacks = {};


/* =========================================
   結果モーダルを生成
========================================= */
function createResultModal() {

    // すでに生成されていれば再利用
    if (resultModal) {
        return;
    }

    // モーダル本体
    resultModal = document.createElement("div");

    resultModal.id = "result-modal";

    resultModal.className =
        "result-modal hidden";


    // モーダル内部
    resultModal.innerHTML = `

        <div class="result-modal-content">

            <h2 id="result-title"></h2>

            <!-- ゲーム情報 -->
            <p id="game-type-label"></p>
            <p id="date-time"></p>

            <!-- 今回結果 -->
            <p id="miss-result"></p>
            <p id="final-time"></p>

            <hr>

            <!-- ベスト表示 -->
            <p id="best-score-label">
                あなたのベストきろく
            </p>

            <p id="best-message"></p>
            <p id="best-date"></p>
            <p id="best-miss"></p>
            <p id="best-time"></p>

            <hr>

            <!-- まちがえた問題 -->
            <p id="word-list-label">
                まちがえた　もんだい
            </p>

            <div id="wrong-list"
                 class="word-list-scroll">
            </div>

            <button id="restart-result-btn">
                もういちど
            </button>

            <button id="menu-result-btn">
                メニューへ
            </button>

        </div>

    `;


    // bodyに追加
    document.body.appendChild(resultModal);


    // ボタン処理
    document
        .getElementById("restart-result-btn")
        .addEventListener("click", () => {

            modalCallbacks.onRestart?.();

        });


    document
        .getElementById("menu-result-btn")
        .addEventListener("click", () => {

            modalCallbacks.onMenu?.();

        });

}


/* =========================================
   結果モーダルを表示
========================================= */

/**
 * @param {Object} resultData - 結果表示用データ
 * @param {Function} callbacks.onRestart - 再スタート処理
 * @param {Function} callbacks.onMenu - メニュー移動処理
 */
export function showResultModal(
    resultData,
    callbacks = {}
) {

    // モーダルを生成
    createResultModal();

    // ボタン処理を保存
    modalCallbacks = callbacks;


    // ゲーム名
    document.getElementById("result-title").textContent =
        `${resultData.gameName}　けっか`;

    document.getElementById("game-type-label").textContent =
        `【${resultData.gameName}】`;


    // プレイ情報
    document.getElementById("date-time").textContent =
        resultData.date;

    document.getElementById("final-time").textContent =
        `タイム：${resultData.time.toFixed(2)}秒`;

    document.getElementById("miss-result").textContent =
        `ミス：${resultData.missCount}回`;


    // ベスト記録
    const bestMessage =
        document.getElementById("best-message");

    const bestDate =
        document.getElementById("best-date");

    const bestMiss =
        document.getElementById("best-miss");

    const bestTime =
        document.getElementById("best-time");


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


    // まちがえた問題
    const wrongListArea =
        document.getElementById("wrong-list");

    wrongListArea.replaceChildren();


    resultData.wrongQuestions.forEach(item => {

        const line = document.createElement("p");


        if (item.question) {

            const question = document.createElement("div");

            question.textContent =
                `もんだい：${item.question}`;

            line.appendChild(question);

        }


        if (item.answer) {

            const answer = document.createElement("div");

            answer.textContent =
                `こたえ：${item.answer}`;

            line.appendChild(answer);

        }


        if (item.detail) {

            const detail = document.createElement("div");

            detail.textContent = item.detail;

            line.appendChild(detail);

        }


        wrongListArea.appendChild(line);

    });


    // モーダルを表示
    resultModal.classList.remove("hidden");

}


/* =========================================
   結果モーダルを非表示
========================================= */
export function hideResultModal() {

    if (resultModal) {

        resultModal.classList.add("hidden");

    }

}
