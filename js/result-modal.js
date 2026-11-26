
/* =========================================
   File: result-modal.js
   Purpose: ゲーム結果モーダルの共通表示
   created: 2026/10/25 by yagi3
   updated: 2026/11/12 html構造変更に対応
========================================= */

// ゲーム進捗（progress.js）をインポート
import { recordGameResult } from "./progress.js";

// モーダルの要素を保持
let resultModal = null;

// 各ゲームから受け取るボタン処理
let modalCallbacks = {};


/* =========================================
   都道府県名の対応表
========================================= */
const PREFECTURE_NAMES = {
    aichi: "愛知県",
    akita: "秋田県",
    aomori: "青森県",
    chiba: "千葉県",
    ehime: "愛媛県",
    fukui: "福井県",
    fukuoka: "福岡県",
    fukushima: "福島県",
    gifu: "岐阜県",
    gunma: "群馬県",
    hiroshima: "広島県",
    hokkaido: "北海道",
    hyogo: "兵庫県",
    ibaraki: "茨城県",
    ishikawa: "石川県",
    iwate: "岩手県",
    kagawa: "香川県",
    kagoshima: "鹿児島県",
    kanagawa: "神奈川県",
    kochi: "高知県",
    kumamoto: "熊本県",
    kyoto: "京都府",
    mie: "三重県",
    miyagi: "宮城県",
    miyazaki: "宮崎県",
    nagano: "長野県",
    nagasaki: "長崎県",
    nara: "奈良県",
    niigata: "新潟県",
    oita: "大分県",
    okayama: "岡山県",
    okinawa: "沖縄県",
    osaka: "大阪府",
    saga: "佐賀県",
    saitama: "埼玉県",
    shiga: "滋賀県",
    shimane: "島根県",
    shizuoka: "静岡県",
    tochigi: "栃木県",
    tokushima: "徳島県",
    tokyo: "東京都",
    tottori: "鳥取県",
    toyama: "富山県",
    wakayama: "和歌山県",
    yamagata: "山形県",
    yamaguchi: "山口県",
    yamanashi: "山梨県"
};


/* =========================================
   獲得バッジの都道府県名を取得
========================================= */
function getEarnedPrefectureNames(earnedBadges) {

    const prefectureCodes = earnedBadges.map(badge => {

        const match = badge.image.match(
            /^\d{2}_\d{2}_\d{2}_([a-z]+)_/
        );

        return match ? match[1] : null;

    });

    // 重複を除いて都道府県名に変換
    return [...new Set(prefectureCodes)]
        .filter(code => code && PREFECTURE_NAMES[code])
        .map(code => PREFECTURE_NAMES[code]);

}


/* =========================================
   バッジ獲得モーダルを生成
========================================= */
let badgeModal = null;

function createBadgeModal() {

    // すでに生成されていれば再利用
    if (badgeModal) {
        return;
    }

    badgeModal = document.createElement("div");

    badgeModal.id = "badge-modal";
    badgeModal.className = "result-modal hidden";

    badgeModal.innerHTML = `

        <div class="result-modal-content">

            <h2>
                バッジゲット！
                <span class="modal-english">Badge Earned!</span>
            </h2>

            <p id="earned-prefectures"></p>
            <p class="modal-english">You got a badge!</p>

            <div id="earned-badge-images"></div>

            <button id="badge-ok-btn">
                OK
            </button>

        </div>

    `;

    // bodyに追加
    document.body.appendChild(badgeModal);

    // OKボタンの処理
    document.getElementById("badge-ok-btn").addEventListener("click", () => {

        // バッジ獲得モーダルを閉じる
        badgeModal.classList.add("hidden");

        // ゲーム結果モーダルを表示する
        resultModal.classList.remove("hidden");

    });

}


/* =========================================
   バッジ獲得モーダルの内容を設定
========================================= */
function showBadgeModal(earnedBadges) {

    createBadgeModal();

    // 獲得した都道府県名
    const prefectureNames =
        getEarnedPrefectureNames(earnedBadges);

    document.getElementById(
        "earned-prefectures"
    ).textContent =
        `${prefectureNames.join("・")}のバッジをゲットだぜ！`;


    // バッジ画像
    const badgeImages =
        document.getElementById("earned-badge-images");

    badgeImages.replaceChildren();

    earnedBadges.forEach(badge => {

        const img = document.createElement("img");

        img.src = `./images/badges/${badge.image}`;
        img.alt = "獲得したバッジ";

        badgeImages.appendChild(img);

    });


    // モーダルを表示
    badgeModal.classList.remove("hidden");

}


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

            <h2>
                <span id="result-title-japanese"></span>
                <span class="modal-english">Result</span>
            </h2>

            <!-- ゲーム情報 -->
            <p id="game-type-label"></p>
            <p id="date-time"></p>

            <!-- 今回結果 -->
            <p id="miss-result">
                <span id="miss-result-japanese"></span>
                / <span class="modal-english-inline">Miss</span>：
                <span id="miss-result-value"></span>
            </p>

            <p id="final-time">
                <span id="final-time-japanese"></span>
                / <span class="modal-english-inline">Time</span>：
                <span id="final-time-value"></span>
            </p>

            <hr>

            <!-- ベスト表示 -->
            <p id="best-score-label">
                あなたのベストきろく
                <span class="modal-english">Your Best Record</span>
            </p>

            <p id="best-message">
                <span id="best-message-japanese"></span>
                <span class="modal-english">New Best Record!</span>
            </p>

            <p id="best-date">
                <span id="best-date-japanese"></span>
                / <span class="modal-english-inline">Date</span>：
                <span id="best-date-value"></span>
            </p>

            <p id="best-miss">
                <span id="best-miss-japanese"></span>
                / <span class="modal-english-inline">Miss</span>：
                <span id="best-miss-value"></span>
            </p>

            <p id="best-time">
                <span id="best-time-japanese"></span>
                / <span class="modal-english-inline">Time</span>：
                <span id="best-time-value"></span>
            </p>

            <hr>

            <!-- まちがえた問題 -->
            <p id="word-list-label">
                まちがえた　もんだい
                <span class="modal-english">Incorrect Answers</span>
            </p>

            <div id="wrong-list"
                 class="word-list-scroll">
            </div>

            <p id="remaining-points">
                <span id="remaining-points-japanese"></span>
                <span class="modal-english">Points until your next badge!</span>
            </p>

            <button id="restart-result-btn">
                もういちど
                <span class="modal-english">Play Again</span>
            </button>

            <button id="menu-result-btn">
                メニューへ
                <span class="modal-english">Back to Menu</span>
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
    // 進捗データを更新
    const progressResult = recordGameResult(
        resultData.category,
        resultData.gameKey,
        {
            time: resultData.time,
            miss: resultData.missCount
        },
        resultData.bestUpdated
    );

    // モーダルを生成
    createResultModal();

    // ボタン処理を保存
    modalCallbacks = callbacks;


    // ゲーム名
    document.getElementById("result-title-japanese").textContent =
        `${resultData.gameName}　けっか`;

    document.getElementById("game-type-label").textContent =
        `【${resultData.gameType}】`;

    document.getElementById("date-time").textContent =
        resultData.date;

    document.getElementById("final-time-japanese").textContent =
        "タイム";

    document.getElementById("final-time-value").textContent =
        `${resultData.time.toFixed(2)}秒`;

    document.getElementById("miss-result-japanese").textContent =
        "ミス";

    document.getElementById("miss-result-value").textContent =
        `${resultData.missCount}回`;

    // 次のバッジまでの残りポイント
    document.getElementById("remaining-points-japanese").textContent =
        `バッジゲットまで、あと ${20 - progressResult.remainingPoints} ポイント！`;

    // ベスト記録
    const bestMessage =
        document.getElementById("best-message");

    const bestDate =
        document.getElementById("best-date");

    const bestMiss =
        document.getElementById("best-miss");

    const bestTime =
        document.getElementById("best-time");


    const bestMessageJapanese =
        document.getElementById("best-message-japanese");

    const bestDateJapanese =
        document.getElementById("best-date-japanese");

    const bestMissJapanese =
        document.getElementById("best-miss-japanese");

    const bestTimeJapanese =
        document.getElementById("best-time-japanese");

    const bestDateValue =
        document.getElementById("best-date-value");

    const bestMissValue =
        document.getElementById("best-miss-value");

    const bestTimeValue =
        document.getElementById("best-time-value");


    if (resultData.bestUpdated) {

        bestMessage.style.display = "block";
        bestMessageJapanese.textContent =
            "🎉 ベストきろく　こうしん！";

        bestDate.style.display = "none";
        bestMiss.style.display = "none";
        bestTime.style.display = "none";

    } else {

        bestMessage.style.display = "none";

        if (resultData.bestRecord) {

            bestDate.style.display = "block";
            bestMiss.style.display = "block";
            bestTime.style.display = "block";

            bestDateJapanese.textContent = "いつ";
            bestDateValue.textContent = resultData.bestRecord.date;

            bestMissJapanese.textContent = "ミス";
            bestMissValue.textContent =
                `${resultData.bestRecord.miss}回`;

            bestTimeJapanese.textContent = "タイム";
            bestTimeValue.textContent =
                `${resultData.bestRecord.time}秒`;

        } else {

            bestDate.style.display = "none";
            bestMiss.style.display = "none";
            bestTime.style.display = "none";

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


    // モーダルの表示を切り替える
    if (progressResult.earnedBadges.length > 0) {

        // バッジを獲得した場合
        showBadgeModal(progressResult.earnedBadges);

    } else {

        // バッジを獲得していない場合
        resultModal.classList.remove("hidden");

    }

}


/* =========================================
   結果モーダルを非表示
========================================= */
export function hideResultModal() {

    if (resultModal) {

        resultModal.classList.add("hidden");

    }

}
