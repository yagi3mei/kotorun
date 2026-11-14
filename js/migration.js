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
   旧スコアデータの検査
========================= */
function validateLegacyScores(scores) {

    for (const [category, games] of Object.entries(scores)) {

        // 空のカテゴリーは移行対象外
        if (
            games === null ||
            typeof games !== "object" ||
            Array.isArray(games)
        ) {
            throw new Error(
                `旧スコアデータのカテゴリー形式が不正です: ${category}`
            );
        }

        if (Object.keys(games).length === 0) {
            continue;
        }

        // ポイント表にカテゴリーが存在するか確認
        const categoryPoints = GAME_POINTS[category];

        if (!categoryPoints) {
            throw new Error(
                `ポイント表にカテゴリーがありません: ${category}`
            );
        }

        // 各ゲームのポイント設定と記録内容を確認
        for (const [gameKey, record] of Object.entries(games)) {

            if (!categoryPoints[gameKey]) {
                throw new Error(
                    `ポイント表にゲームがありません: ${category} / ${gameKey}`
                );
            }

            // ベスト記録の形式を確認
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
        }
    }

    return true;
}

/* =========================
   旧ベスト記録の移行ポイント計算
========================= */
function calculateMigrationPoints(scores) {

    let totalPoints = 0;

    for (const [category, games] of Object.entries(scores)) {

        // 空のカテゴリーは対象外
        if (Object.keys(games).length === 0) {
            continue;
        }

        const categoryPoints = GAME_POINTS[category];

        for (const gameKey of Object.keys(games)) {

            totalPoints += categoryPoints[gameKey].fullPoints;
        }
    }

    return totalPoints;
}

/* =========================
   新しい進捗データの保存
========================= */
const PROGRESS_STORAGE_KEY = "kotorun-progress";

/* =========================
   新しい進捗データの形式検査
========================= */
function validateProgressData(progress) {

    // 進捗データ全体の形式を確認
    if (
        progress === null ||
        typeof progress !== "object" ||
        Array.isArray(progress)
    ) {
        throw new Error("進捗データの形式が正しくありません。");
    }

    if (
        typeof progress.migrationCompleted !== "boolean" ||
        !Number.isFinite(progress.points) ||
        progress.points < 0 ||
        !Number.isInteger(progress.lastBadgeId) ||
        progress.lastBadgeId < 0 ||
        progress.lastBadgeId > badgeList.length ||
        !Number.isFinite(progress.totalPlayTime) ||
        progress.totalPlayTime < 0 ||
        !Number.isInteger(progress.totalClearCount) ||
        progress.totalClearCount < 0
    ) {
        throw new Error("進捗データの項目が正しくありません。");
    }

    // 月別データの検査
    if (
        progress.monthly === null ||
        typeof progress.monthly !== "object" ||
        Array.isArray(progress.monthly)
    ) {
        throw new Error("月別学習記録の形式が正しくありません。");
    }

    for (const [month, record] of Object.entries(progress.monthly)) {

        if (
            !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
            record === null ||
            typeof record !== "object" ||
            Array.isArray(record) ||
            !Number.isFinite(record.playTime) ||
            record.playTime < 0 ||
            !Number.isInteger(record.clearCount) ||
            record.clearCount < 0
        ) {
            throw new Error(
                `月別学習記録が正しくありません: ${month}`
            );
        }
    }

    return true;
}

function saveMigratedProgress(points) {

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
        totalPlayTime: 0,
        totalClearCount: 0,
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

    // 新しい進捗データを保存
    return saveMigratedProgress(points);
}