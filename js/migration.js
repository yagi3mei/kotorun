/* =========================================
   File: migration.js
   Purpose: 過去のlocalStorageデータの移行モジュール
   Author: やぎさん
   Created: 2026-11-10

   Notes:
   - localStorage を読み込んで、成績をポイントに変換してバッジを取得する。
========================================= */

/* =========================
   localStorage キー名
========================= */
import { STORAGE_KEY } from "./storage.js";
import GAME_POINTS from "./game-points.js";
import badgeList from "../data/badges/badge-list.js";
import { validateProgressData } from "./progress-validation.js";

/* =========================
   旧スコアデータの安全な読み込み
========================= */
function readLegacyScores() {

    const data = localStorage.getItem(STORAGE_KEY);

    // 旧データが存在しない場合
    if (data === null) {
        return {};
    }

    // JSONを解析する
    const scores = JSON.parse(data);

    // オブジェクト形式か確認する
    if (
        scores === null ||
        typeof scores !== "object" ||
        Array.isArray(scores)
    ) {
        throw new Error("旧スコアデータの形式が正しくありません。");
    }

    return scores;
}


/* =========================
   移行対象の旧スコア記録を取得
========================= */
function getMigratableRecords(scores) {

    const records = [];

    for (const [category, games] of Object.entries(scores)) {

        // ポイント表にないカテゴリーは無視
        const categoryPoints = GAME_POINTS[category];

        if (!categoryPoints) {
            continue;
        }

        // 現在有効なカテゴリーのデータ形式を確認
        if (
            games === null ||
            typeof games !== "object" ||
            Array.isArray(games)
        ) {
            throw new Error(
                `旧スコアデータのカテゴリー形式が不正です: ${category}`
            );
        }

        for (const [gameKey, record] of Object.entries(games)) {

            // ポイント表にないゲームキーは無視
            if (!categoryPoints[gameKey]) {
                continue;
            }

            // 現在有効なゲームのベスト記録形式を確認
            if (
                record === null ||
                typeof record !== "object" ||
                Array.isArray(record) ||
                !Number.isFinite(record.time) ||
                record.time <= 0 ||
                !Number.isFinite(record.miss) ||
                record.miss < 0
            ) {
                throw new Error(
                    `ベスト記録の形式が不正です: ${category} / ${gameKey}`
                );
            }

            records.push({
                category,
                gameKey,
                record
            });
        }
    }

    return records;
}

/* =========================
   旧スコアデータの検査
========================= */
function validateLegacyScores(scores) {

    getMigratableRecords(scores);

    return true;
}

/* =========================
   旧ベスト記録の移行ポイント計算
========================= */
function calculateMigrationPoints(scores) {

    let totalPoints = 0;

    const records = getMigratableRecords(scores);

    for (const { category, gameKey } of records) {

        totalPoints += GAME_POINTS[category][gameKey].fullPoints;
    }

    return totalPoints;
}

/* =========================
   旧ベスト記録の学習統計計算
========================= */
function calculateMigrationStats(scores) {

    let totalPlayTime = 0;
    let totalClearCount = 0;

    const records = getMigratableRecords(scores);

    for (const { record } of records) {

        totalPlayTime += record.time;
        totalClearCount += 1;
    }

    return {
        totalPlayTime,
        totalClearCount
    };
}


/* =========================
   新しい進捗データの保存
========================= */
const PROGRESS_STORAGE_KEY = "kotorun-progress";

function saveMigratedProgress(points, stats) {

    // 20ポイントごとにバッジを獲得
    const badgeCount = Math.min(
        Math.floor(points / 20),
        badgeList.length
    );

    // バッジ獲得後の残りポイント
    const remainingPoints = points - (badgeCount * 20);

    const progress = {
        migrationCompleted: true,
        points: remainingPoints,
        lastBadgeId: badgeCount,
        totalPlayTime: stats.totalPlayTime,
        totalClearCount: stats.totalClearCount,
        monthly: {}
    };

    localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify(progress)
    );

    return progress;
}

/* =========================
   旧データの移行処理
========================= */
export function migrateLegacyScores() {

    const currentData =
        localStorage.getItem(PROGRESS_STORAGE_KEY);

    // 新しい進捗データがすでに存在する場合
    if (currentData !== null) {

        const currentProgress = JSON.parse(currentData);

        validateProgressData(currentProgress);

        // 移行済みなら何もしない
        if (currentProgress.migrationCompleted === true) {
            return currentProgress;
        }

        // 未移行データに既存の学習記録があれば上書きしない
        if (
            currentProgress.points !== 0 ||
            currentProgress.lastBadgeId !== 0 ||
            currentProgress.totalPlayTime !== 0 ||
            currentProgress.totalClearCount !== 0 ||
            Object.keys(currentProgress.monthly).length !== 0
        ) {
            throw new Error(
                "未移行の進捗データに既存の記録があります。"
            );
        }
    }

    // 旧データを読み込む
    const scores = readLegacyScores();

    // 旧データとポイント表を照合
    validateLegacyScores(scores);

    // 移行ポイントを計算
    const points = calculateMigrationPoints(scores);

    // 累計学習時間・累計クリア数を計算
    const stats = calculateMigrationStats(scores);

    // 新しい進捗データを保存
    return saveMigratedProgress(points, stats);
}