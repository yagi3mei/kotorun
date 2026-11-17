/* =========================================
   File: progress.js
   Purpose: ポイント・学習記録・バッジ管理 共通モジュール
   Author: やぎさん
   Created: 2026-11-10

   Notes:
    - ゲームクリア時の共通処理を管理する
    - 進捗データの読み込みと形式検査を行う
========================================= */

/* =========================
   モジュールの読み込み
========================= */
import GAME_POINTS from "./game-points.js";
import badgeList from "../data/badges/badge-list.js";
import { migrateLegacyScores } from "./migration.js";

/* =========================
   localStorage キー名
========================= */
const PROGRESS_STORAGE_KEY = "kotorun-progress";


/* =========================
   初回読み込み時の旧データ移行
========================= */
let progressData;

try {

    progressData = migrateLegacyScores();

} catch (error) {

    console.error("progress initialization error:", error);

    throw error;
}


/* =========================
   進捗データの保存
========================= */
function saveProgress() {

    localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify(progressData)
    );
}

/* =========================
   現在の進捗データ取得
========================= */
export function getProgress() {

    return {
        ...progressData,
        monthly: Object.fromEntries(
            Object.entries(progressData.monthly).map(
                ([month, record]) => [
                    month,
                    { ...record }
                ]
            )
        )
    };
}

/* =========================
   ゲームクリア時の共通処理
========================= */

export function recordGameResult(
    category,
    gameKey,
    result,
    bestUpdated
) {

    // ゲーム結果の形式を確認
    if (
        result === null ||
        typeof result !== "object" ||
        Array.isArray(result) ||
        !Number.isFinite(result.time) ||
        result.time <= 0 ||
        !Number.isFinite(result.miss) ||
        result.miss < 0
    ) {
        throw new Error("ゲーム結果の形式が正しくありません。");
    }

    // ポイント設定を取得
    const pointData = GAME_POINTS[category]?.[gameKey];

    if (
        !pointData ||
        !Number.isFinite(pointData.fullPoints) ||
        !Number.isFinite(pointData.halfPoints)
    ) {
        throw new Error(
            `ポイント設定がありません: ${category} / ${gameKey}`
        );
    }

    // 変更前の進捗データを退避
    const previousProgressData =
        JSON.parse(JSON.stringify(progressData));

    // 復元処理に使用する変数
    let earnedPoints = 0;
    const earnedBadges = [];

    try {

        // 満額・半額ポイントを決定
        earnedPoints = bestUpdated
            ? pointData.fullPoints
            : pointData.halfPoints;

        // ポイントを加算
        progressData.points += earnedPoints;

        // 現在の学習月を取得
        const now = new Date();

        const month =
            `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        // 累計学習時間とクリア回数を更新
        progressData.totalPlayTime += result.time;
        progressData.totalClearCount += 1;

        // 月別記録がなければ初期化
        if (!progressData.monthly[month]) {

            progressData.monthly[month] = {
                playTime: 0,
                clearCount: 0
            };
        }

        // 月別学習時間とクリア回数を更新
        progressData.monthly[month].playTime += result.time;
        progressData.monthly[month].clearCount += 1;

        // 20ポイントごとに次のバッジを獲得
        while (
            progressData.points >= 20 &&
            progressData.lastBadgeId < badgeList.length
        ) {

            // 次のバッジID
            const nextBadgeId = progressData.lastBadgeId + 1;

            // バッジ一覧から取得
            const badge = badgeList[nextBadgeId - 1];

            if (!badge) {
                throw new Error(
                    `バッジが見つかりません: ID ${nextBadgeId}`
                );
            }

            earnedBadges.push(badge);

            // 獲得済みIDを更新
            progressData.lastBadgeId = nextBadgeId;

            // バッジ1個分のポイントを消費
            progressData.points -= 20;
        }

        // 進捗データを保存
        saveProgress();

    } catch (error) {

        // 進捗データを変更前の状態に戻す
        progressData = previousProgressData;

        // 最初に発生したエラーを返す
        throw error;
    }

    // ゲーム側に結果を返す
    return {
        earnedPoints,
        remainingPoints: progressData.points,
        earnedBadges,
        lastBadgeId: progressData.lastBadgeId
    };
}
