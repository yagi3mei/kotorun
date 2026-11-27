
/* =========================================
   File: progress-page.js
   Purpose: 学習記録・バッジ管理画面
   Author: やぎさん
   Created: 2026-11-15

   Notes:
   - 進捗画面の表示処理を管理する
   - 進捗データは progress.js から取得する
========================================= */

/* =========================
   モジュールの読み込み
========================= */
import { getProgress } from "./progress.js";
import { loadScores } from "./storage.js";
import GAME_POINTS from "./game-points.js";
import badgeList from "../data/badges/badge-list.js";


/* =========================
   ゲーム進捗の表示
========================= */
function displayGameProgress() {

    // ゲーム定義とスコアを取得
    const scores = loadScores();

    let totalCount = 0;
    let clearedCount = 0;

    // 全ゲームの種類数とクリア済み数を集計
    for (const [category, games] of Object.entries(GAME_POINTS)) {

        const gameKeys = Object.keys(games);
        totalCount += gameKeys.length;

        const categoryScores = scores[category];

        if (!categoryScores) {
            continue;
        }

        for (const gameKey of gameKeys) {

            if (
                Object.prototype.hasOwnProperty.call(
                    categoryScores,
                    gameKey
                )
            ) {
                clearedCount++;
            }
        }
    }

    // 進捗率を計算
    const percentage = totalCount > 0
        ? (clearedCount / totalCount) * 100
        : 0;

    // 数値を表示
    document.getElementById("game-progress-cleared").textContent =
        clearedCount;

    document.getElementById("game-progress-total").textContent =
        totalCount;

    // 進捗バーを表示
    document.getElementById("game-progress-bar-fill").style.width =
        `${percentage}%`;
}


/* =========================
   現在の県番号を取得
========================= */
function getCurrentPrefectureNumber(lastBadgeId) {

    // バッジ未獲得なら北海道
    if (lastBadgeId === 0) {
        return "01";
    }

    // 最後に獲得したバッジを取得
    const badge = badgeList.find(
        item => item.id === lastBadgeId
    );

    // バッジが見つからない場合
    if (!badge) {
        return "01";
    }

    // 画像ファイル名から県番号を取得
    return badge.image.substring(0, 2);
}


/* =========================
   獲得済みの県番号一覧を取得
========================= */
function getEarnedPrefectureNumbers(lastBadgeId) {

    // 最後に獲得したバッジまでを対象にする
    const earnedBadges = badgeList.filter(
        badge => badge.id <= lastBadgeId
    );

    // 画像ファイル名から県番号を取り出す
    const prefectureNumbers = earnedBadges.map(
        badge => badge.image.substring(0, 2)
    );

    // 重複する県番号を取り除く
    return [...new Set(prefectureNumbers)];
}


/* =========================
   県番号とSVGファイル名と日本語名の対応表
========================= */
const PREFECTURE_FILES = {
    "01": { file: "Hokkaido", name: "北海道" },
    "02": { file: "Aomori", name: "青森県" },
    "03": { file: "Akita", name: "秋田県" },
    "04": { file: "Yamagata", name: "山形県" },
    "05": { file: "Niigata", name: "新潟県" },
    "06": { file: "Nagano", name: "長野県" },
    "07": { file: "Toyama", name: "富山県" },
    "08": { file: "Ishikawa", name: "石川県" },
    "09": { file: "Fukui", name: "福井県" },
    "10": { file: "Shiga", name: "滋賀県" },
    "11": { file: "Kyoto", name: "京都府" },
    "12": { file: "Hyogo", name: "兵庫県" },
    "13": { file: "Tottori", name: "鳥取県" },
    "14": { file: "Shimane", name: "島根県" },
    "15": { file: "Yamaguchi", name: "山口県" },
    "16": { file: "Fukuoka", name: "福岡県" },
    "17": { file: "Saga", name: "佐賀県" },
    "18": { file: "Nagasaki", name: "長崎県" },
    "19": { file: "Kumamoto", name: "熊本県" },
    "20": { file: "Kagoshima", name: "鹿児島県" },
    "21": { file: "Okinawa", name: "沖縄県" },
    "22": { file: "Miyazaki", name: "宮崎県" },
    "23": { file: "Oita", name: "大分県" },
    "24": { file: "Kochi", name: "高知県" },
    "25": { file: "Tokushima", name: "徳島県" },
    "26": { file: "Kagawa", name: "香川県" },
    "27": { file: "Ehime", name: "愛媛県" },
    "28": { file: "Hiroshima", name: "広島県" },
    "29": { file: "Okayama", name: "岡山県" },
    "30": { file: "Osaka", name: "大阪府" },
    "31": { file: "Nara", name: "奈良県" },
    "32": { file: "Wakayama", name: "和歌山県" },
    "33": { file: "Mie", name: "三重県" },
    "34": { file: "Gifu", name: "岐阜県" },
    "35": { file: "Aichi", name: "愛知県" },
    "36": { file: "Shizuoka", name: "静岡県" },
    "37": { file: "Yamanashi", name: "山梨県" },
    "38": { file: "Kanagawa", name: "神奈川県" },
    "39": { file: "Tokyo", name: "東京都" },
    "40": { file: "Saitama", name: "埼玉県" },
    "41": { file: "Gunma", name: "群馬県" },
    "42": { file: "Tochigi", name: "栃木県" },
    "43": { file: "Chiba", name: "千葉県" },
    "44": { file: "Ibaraki", name: "茨城県" },
    "45": { file: "Fukushima", name: "福島県" },
    "46": { file: "Miyagi", name: "宮城県" },
    "47": { file: "Iwate", name: "岩手県" }
};


/* =========================
   SVGファイル名を取得
========================= */
function getPrefectureFileName(prefectureNumber) {

    return PREFECTURE_FILES[prefectureNumber]?.file;
}


/* =========================
   都道府県のSVGを地図に重ねる
========================= */
async function displayPrefectureMap(prefectureNumber, lastBadgeId) {

    // SVGファイル名を取得
    const fileName =
        getPrefectureFileName(prefectureNumber);

    // SVGファイルを読み込む
    const response = await fetch(
        `images/map/${prefectureNumber}_${fileName}.svg`
    );

    if (!response.ok) {
        throw new Error(
            `県のSVGを読み込めません: ${prefectureNumber}`
        );
    }

    // SVGの内容を取得
    const svgText = await response.text();

    // SVG文字列をHTMLとして解析
    const parser = new DOMParser();
    const svgDocument = parser.parseFromString(
        svgText,
        "image/svg+xml"
    );

    // SVG要素を取得
    const prefectureSvg =
        document.importNode(
            svgDocument.documentElement,
            true
        );

    prefectureSvg.classList.add("prefecture-map-image");

    // 県の形をクリックしたときの処理
    const prefecturePath =
        prefectureSvg.querySelector("path");

    prefecturePath.addEventListener("click", () => {

        // バッジモーダルを開く
        openPrefectureModal(
            prefectureNumber,
            lastBadgeId
        );
    });

    // 日本地図の上に追加
    document.getElementById("japan-map")
        .appendChild(prefectureSvg);
}


/* =========================
   日本地図とランナーの表示
========================= */
async function displayJapanMap(runnerPosition, lastBadgeId) {

    const mapContainer =
        document.getElementById("japan-map");

    // 白地図を作成
    const mapImage = document.createElement("img");

    mapImage.alt = "日本地図";
    mapImage.className = "japan-map-image";

    // 画像の読み込み完了を待つ
    const imageLoaded = new Promise((resolve, reject) => {
        mapImage.onload = resolve;
        mapImage.onerror = reject;
    });

    mapImage.src = "images/map/white_map.svg";

    mapContainer.appendChild(mapImage);

    await imageLoaded;

    // 地図の表示サイズを取得
    const mapWidth = mapImage.clientWidth;
    const mapHeight = mapImage.clientHeight;

    // SVGの座標を表示位置に変換
    const runnerX =
        runnerPosition.x / 428.06601 * mapWidth;

    const runnerY =
        runnerPosition.y / 396.59015 * mapHeight;

    // ランナー画像を作成
    const runner = document.createElement("img");

    runner.src = "images/badges/runner/runner_01.png";
    runner.alt = "現在取り組んでいる県";
    runner.className = "progress-runner";

    // ランナーの位置を指定
    runner.style.left = `${runnerX}px`;
    runner.style.top = `${runnerY}px`;

    mapContainer.appendChild(runner);

    // ランナーをクリックしたときの処理
    runner.addEventListener("click", () => {

        // 現在の県番号を取得
        const prefectureNumber =
            getCurrentPrefectureNumber(lastBadgeId);

        // 現在の県のバッジモーダルを開く
        openPrefectureModal(
            prefectureNumber,
            lastBadgeId
        );
    });

    // ランナーのアニメーション
    let runnerFrame = 1;

    setInterval(() => {

        // 画像を交互に切り替える
        runnerFrame = runnerFrame === 1 ? 2 : 1;

        const runnerImage =
            `images/badges/runner/runner_0${runnerFrame}.png`;

        // 地図上のランナー
        runner.src = runnerImage;

        // モーダル内のランナー
        document.getElementById("modal-runner").src =
            runnerImage;

    }, 500);

}


/* =========================
   学習記録を画面に表示
========================= */
function displayLearningRecords(progress) {

    // 累計学習時間（秒から分に変換）
    const totalPlayTime =
        Math.floor(progress.totalPlayTime / 60);

    // 累計クリア回数
    const totalClearCount =
        progress.totalClearCount;

    // 現在の年月を取得
    const now = new Date();

    const currentMonth =
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // 今月の学習記録を取得
    const monthlyRecord =
        progress.monthly[currentMonth] ?? {
            playTime: 0,
            clearCount: 0
        };

    // 今月の学習時間（秒から分に変換）
    const monthlyPlayTime =
        Math.floor(monthlyRecord.playTime / 60);

    // 今月のクリア回数
    const monthlyClearCount =
        monthlyRecord.clearCount;
    
    // 3桁区切りの表示用数値
    const formattedTotalPlayTime =
        totalPlayTime.toLocaleString("ja-JP");

    const formattedTotalClearCount =
        totalClearCount.toLocaleString("ja-JP");

    const formattedMonthlyPlayTime =
        monthlyPlayTime.toLocaleString("ja-JP");

    const formattedMonthlyClearCount =
        monthlyClearCount.toLocaleString("ja-JP");

    // 累計学習時間
    document.getElementById("total-play-time").textContent =
        formattedTotalPlayTime;

    // 累計クリア回数
    document.getElementById("total-clear-count").textContent =
        formattedTotalClearCount;

    // 今月の学習時間
    document.getElementById("monthly-play-time").textContent =
        formattedMonthlyPlayTime;

    // 今月のクリア回数
    document.getElementById("monthly-clear-count").textContent =
        formattedMonthlyClearCount;

}


/* =========================
   日本一周の進捗情報を表示
========================= */
function displayMapProgress(lastBadgeId) {

    // 獲得済みバッジを取得
    const earnedBadges = badgeList.filter(
        badge => badge.id <= lastBadgeId
    );

    // 獲得バッジ数
    const badgeCount = earnedBadges.length;

    // 全バッジ数
    const totalBadgeCount = badgeList.length;

    // 最後に獲得したバッジ
    const lastEarnedBadge =
        earnedBadges[earnedBadges.length - 1];

    // 現在の周回数（未獲得なら1周目）
    const roundNumber = lastEarnedBadge
        ? Number(lastEarnedBadge.image.split("_")[1])
        : 1;

    // 日本語表示
    document.getElementById("round-number-ja")
        .textContent = roundNumber;

    document.getElementById("badge-count-ja")
        .textContent = badgeCount;

    document.getElementById("badge-total-ja")
        .textContent = totalBadgeCount;

    // 英語表示
    document.getElementById("round-number-en")
        .textContent = roundNumber;

    document.getElementById("badge-count-en")
        .textContent = badgeCount;

    document.getElementById("badge-total-en")
        .textContent = totalBadgeCount;

}


/* =========================
   画面の初期表示
========================= */
async function initializeProgressPage() {

    // 進捗データを取得
    const progress = getProgress();

    // 学習記録を表示
    displayLearningRecords(progress);

    // ゲームの進捗を表示
    displayGameProgress();

    // 日本一周の進捗情報を表示
    displayMapProgress(progress.lastBadgeId);

    // 獲得済みの県番号一覧を取得
    const earnedPrefectureNumbers =
        getEarnedPrefectureNumbers(progress.lastBadgeId);

    // 獲得済みの県SVGを並行して読み込み、地図に重ねる
    await Promise.all(
        earnedPrefectureNumbers.map(prefectureNumber =>
            displayPrefectureMap(
                prefectureNumber,
                progress.lastBadgeId
            )
        )
    );

    // 最後に獲得したバッジから現在の県番号を取得
    const prefectureNumber =
        getCurrentPrefectureNumber(progress.lastBadgeId);

    // 現在の県のランナー配置座標を取得
    const runnerPosition =
        await getPrefecturePosition(prefectureNumber);

    // 日本地図とランナーを表示
    await displayJapanMap(
        runnerPosition,
        progress.lastBadgeId
    );
}

/* =========================
   県のランナー配置座標を取得
========================= */
async function getPrefecturePosition(prefectureNumber) {

    // 対象の県のSVGを読み込む
    const response = await fetch(
        `images/map/${prefectureNumber}_`
        + `${getPrefectureFileName(prefectureNumber)}.svg`
    );

    if (!response.ok) {
        throw new Error(
            `県のSVGを読み込めません: ${prefectureNumber}`
        );
    }

    const svgText = await response.text();

    // SVG文字列をDOMに変換
    const parser = new DOMParser();
    const svgDocument =
        parser.parseFromString(svgText, "image/svg+xml");

    // SVGをページ内に一時配置
    const svgElement =
        document.importNode(svgDocument.documentElement, true);

    svgElement.style.position = "absolute";
    svgElement.style.visibility = "hidden";

    document.body.appendChild(svgElement);

    // 県の図形を取得
    const path = svgElement.querySelector("path");

    if (!path) {
        svgElement.remove();
        throw new Error(
            `県の図形が見つかりません: ${prefectureNumber}`
        );
    }

    // 図形の外接矩形と変換行列を取得
    const bounds = path.getBBox();
    const matrix = path.getCTM();

    // 県の下辺中央
    const centerX = bounds.x + bounds.width / 2;
    const bottomY = bounds.y + bounds.height;

    // 変換後の座標
    const position = {
        x: matrix.a * centerX +
           matrix.c * bottomY +
           matrix.e,

        y: matrix.b * centerX +
           matrix.d * bottomY +
           matrix.f
    };

    // 一時配置したSVGを削除
    svgElement.remove();

    return position;
}


/* =========================
   都道府県名をモーダルに表示
========================= */
function displayPrefectureName(prefectureNumber) {

    // 都道府県の日本語名を取得
    const prefectureName =
        PREFECTURE_FILES[prefectureNumber]?.name;

    // モーダルに表示
    document.getElementById("modal-prefecture-name")
        .textContent = prefectureName ?? "";
}


/* =========================
   獲得済みバッジをモーダルに表示
========================= */
function displayPrefectureBadges(prefectureNumber, lastBadgeId) {

    // バッジ一覧の表示領域を取得
    const badgeContainer =
        document.getElementById("prefecture-badge-list");

    // 前回の表示内容をクリア
    badgeContainer.innerHTML = "";

    // 選択した県の獲得済みバッジを抽出
    const earnedBadges = badgeList.filter(badge =>
        badge.image.substring(0, 2) === prefectureNumber &&
        badge.id <= lastBadgeId
    );

    // バッジ画像を表示
    earnedBadges.forEach(badge => {

        const badgeImage = document.createElement("img");

        badgeImage.src = `images/badges/${badge.image}`;
        badgeImage.alt = "";

        badgeContainer.appendChild(badgeImage);
    });
}


/* =========================
   都道府県のバッジモーダルを開く
========================= */
function openPrefectureModal(prefectureNumber, lastBadgeId) {

    // 都道府県名を表示
    displayPrefectureName(prefectureNumber);

    // 獲得済みバッジを表示
    displayPrefectureBadges(prefectureNumber, lastBadgeId);

    // モーダルを表示
    document.getElementById("prefecture-modal")
        .hidden = false;
}


/* =========================
   都道府県のバッジモーダルを閉じる
========================= */
function closePrefectureModal() {

    document.getElementById("prefecture-modal")
        .hidden = true;
}


/* =========================
   モーダルの戻るボタン
========================= */
document.getElementById("close-prefecture-modal")
    .addEventListener("click", closePrefectureModal);


// 画面の初期化
initializeProgressPage();
