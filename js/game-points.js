/* =========================================
   File: game-points.js
   Purpose: ゲームごとの満額ポイント・半額ポイント定義
   Updated: 2026-11-07

   付与ルール：
   - 初めて実施したゲーム：満額ポイント
   - ベスト記録を更新したゲーム：満額ポイント
   - ベスト記録を更新しなかったプレイ：クリア時に半額ポイント
   - 半額ポイントは満額の1/2を小数点以下切り上げ

   category / key は storage.js の saveScore() と同じ値を使用する
========================================= */

const GAME_POINTS = Object.freeze({

    // かなゲーム＆かなゲームランダム
    "kana": Object.freeze({
        "hiragana_seion": Object.freeze({ fullPoints: 23, halfPoints: 12 }),
        "hiragana_dakuon": Object.freeze({ fullPoints: 13, halfPoints: 7 }),
        "hiragana_youon": Object.freeze({ fullPoints: 17, halfPoints: 9 }),
        "katakana_seion": Object.freeze({ fullPoints: 23, halfPoints: 12 }),
        "katakana_dakuon": Object.freeze({ fullPoints: 13, halfPoints: 7 }),
        "katakana_youon": Object.freeze({ fullPoints: 17, halfPoints: 9 }),
        "katakana_extra": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "random_hiragana_seion": Object.freeze({ fullPoints: 46, halfPoints: 23 }),
        "random_hiragana_dakuon": Object.freeze({ fullPoints: 25, halfPoints: 13 }),
        "random_hiragana_youon": Object.freeze({ fullPoints: 33, halfPoints: 17 }),
        "random_katakana_seion": Object.freeze({ fullPoints: 46, halfPoints: 23 }),
        "random_katakana_dakuon": Object.freeze({ fullPoints: 25, halfPoints: 13 }),
        "random_katakana_youon": Object.freeze({ fullPoints: 33, halfPoints: 17 }),
        "random_katakana_extra": Object.freeze({ fullPoints: 10, halfPoints: 5 })
    }),

    // たんごかるたゲーム
    "karuta": Object.freeze({
        "hira-dakuon-ba": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-dakuon-be": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "hira-dakuon-da": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "hira-dakuon-de": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "hira-dakuon-do": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-dakuon-ga": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-dakuon-ge": Object.freeze({ fullPoints: 3, halfPoints: 2 }),
        "hira-dakuon-go": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-dakuon-ji": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "hira-dakuon-za": Object.freeze({ fullPoints: 3, halfPoints: 2 }),
        "hira-seion-a": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-chi": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-e": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-fu": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "hira-seion-ha": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-hi": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ho": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "hira-seion-i": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ka": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ke": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "hira-seion-ki": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ko": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "hira-seion-ku": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ma": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-me": Object.freeze({ fullPoints: 3, halfPoints: 2 }),
        "hira-seion-mi": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-mo": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "hira-seion-na": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ne": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "hira-seion-ni": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-no": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-o": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ra": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "hira-seion-sa": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-se": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-shi": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-so": Object.freeze({ fullPoints: 3, halfPoints: 2 }),
        "hira-seion-su": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ta": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-te": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-to": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-tsu": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-u": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-wa": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ya": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-yo": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-seion-yu": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-youon-byo": Object.freeze({ fullPoints: 2, halfPoints: 1 }),
        "hira-youon-chu": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-youon-gyu": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-youon-kyu": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-youon-ryu": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-youon-sha": Object.freeze({ fullPoints: 3, halfPoints: 2 }),
        "hira-youon-sho": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-youon-shu": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "kata-dakuon-ba": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "kata-dakuon-da": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "kata-dakuon-gu": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "kata-dakuon-pa": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "kata-dakuon-pi": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "kata-seion-a": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "kata-seion-e": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "kata-seion-ha": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "kata-seion-ka": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "kata-seion-ku": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "kata-seion-mi": Object.freeze({ fullPoints: 2, halfPoints: 1 }),
        "kata-seion-na": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "kata-seion-ra": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "kata-seion-sa": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "kata-seion-se": Object.freeze({ fullPoints: 3, halfPoints: 2 }),
        "kata-seion-shi": Object.freeze({ fullPoints: 3, halfPoints: 2 }),
        "kata-seion-su": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "kata-seion-ta": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "kata-seion-te": Object.freeze({ fullPoints: 4, halfPoints: 2 })
    }),

    // ことばさがしゲーム
    "kotobasagashi": Object.freeze({
        "hira-dakuon-ba": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-dakuon-be": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-dakuon-da": Object.freeze({ fullPoints: 2, halfPoints: 1 }),
        "hira-dakuon-de": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "hira-dakuon-do": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-dakuon-ga": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "hira-dakuon-ge": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-dakuon-go": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-dakuon-ji": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "hira-dakuon-za": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-a": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "hira-seion-chi": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-e": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "hira-seion-fu": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "hira-seion-ha": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "hira-seion-hi": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "hira-seion-ho": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-i": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ka": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "hira-seion-ke": Object.freeze({ fullPoints: 2, halfPoints: 1 }),
        "hira-seion-ki": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "hira-seion-ko": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "hira-seion-ku": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "hira-seion-ma": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "hira-seion-me": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-mi": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "hira-seion-mo": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-na": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ne": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-seion-ni": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "hira-seion-no": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-o": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ra": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "hira-seion-sa": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "hira-seion-se": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "hira-seion-shi": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "hira-seion-so": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-su": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ta": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-seion-te": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "hira-seion-to": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-tsu": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-seion-u": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "hira-seion-wa": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-seion-ya": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "hira-seion-yo": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-seion-yu": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-youon-byo": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-youon-chu": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "hira-youon-gyu": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "hira-youon-kyu": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "hira-youon-ryu": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-youon-sha": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hira-youon-sho": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "hira-youon-shu": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "kata-dakuon-ba": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "kata-dakuon-da": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "kata-dakuon-gu": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "kata-dakuon-pa": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "kata-dakuon-pi": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "kata-seion-a": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "kata-seion-e": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "kata-seion-ha": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "kata-seion-ka": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "kata-seion-ku": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "kata-seion-mi": Object.freeze({ fullPoints: 2, halfPoints: 1 }),
        "kata-seion-na": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "kata-seion-ra": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "kata-seion-sa": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "kata-seion-se": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "kata-seion-shi": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "kata-seion-su": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "kata-seion-ta": Object.freeze({ fullPoints: 8, halfPoints: 4 }),
        "kata-seion-te": Object.freeze({ fullPoints: 8, halfPoints: 4 })
    }),

    // かぞくゲーム
    "family": Object.freeze({
        "inner": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "outer": Object.freeze({ fullPoints: 4, halfPoints: 2 }),
        "relative": Object.freeze({ fullPoints: 3, halfPoints: 2 })
    }),

    // からだゲーム
    "karada": Object.freeze({
        "face": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "upper": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "lower": Object.freeze({ fullPoints: 5, halfPoints: 3 })
    }),

    // 国・地域ゲーム
    "country": Object.freeze({
        "country_game": Object.freeze({ fullPoints: 10, halfPoints: 5 })
    }),

    // カレンダーゲーム
    "calendar": Object.freeze({
        "calendar": Object.freeze({ fullPoints: 16, halfPoints: 8 })
    }),

    // ひづけゲーム
    "hizuke": Object.freeze({
        "day": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "week": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "month": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "year": Object.freeze({ fullPoints: 5, halfPoints: 3 }),
        "random": Object.freeze({ fullPoints: 12, halfPoints: 6 })
    }),

    // ねんれいゲーム
    "age": Object.freeze({
        "age_game": Object.freeze({ fullPoints: 10, halfPoints: 5 })
    }),

    // かぞえかたゲーム
    "kazoekata": Object.freeze({
        "tsu": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "ko": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "hon": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "mai": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "nin": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "dai": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "satsu": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "random": Object.freeze({ fullPoints: 10, halfPoints: 5 })
    }),

    // とけいゲーム
    "tokei": Object.freeze({
        "beginner": Object.freeze({ fullPoints: 10, halfPoints: 5 }),
        "intermediate": Object.freeze({ fullPoints: 10, halfPoints: 5 })
    }),

    // どうしゲーム
    "doushi_normal": Object.freeze({
        "a1": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "a2": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "ha": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "he": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hi": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "i1": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "i2": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "ka1": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "ka2": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "ka3": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "ki": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "ku": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "ma": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "mo": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "na": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "ne": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "no": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "nu": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "o1": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "o2": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "ri": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "sa": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "se": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "shi1": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "shi2": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "so": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "su": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "ta": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "te": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "to": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "tsu": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "u": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "wa": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "ya": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "yo": Object.freeze({ fullPoints: 12, halfPoints: 6 })
    }),

    // どうしゲーム（ランダム）
    "doushi_random": Object.freeze({
        "a1": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "a2": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "ha": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "he": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "hi": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "i1": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "i2": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "ka1": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "ka2": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "ka3": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "ki": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "ku": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "ma": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "mo": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "na": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "ne": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "no": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "nu": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "o1": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "o2": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "ri": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "sa": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "se": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "shi1": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "shi2": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "so": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "su": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "ta": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "te": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "to": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "tsu": Object.freeze({ fullPoints: 18, halfPoints: 9 }),
        "u": Object.freeze({ fullPoints: 24, halfPoints: 12 }),
        "wa": Object.freeze({ fullPoints: 12, halfPoints: 6 }),
        "ya": Object.freeze({ fullPoints: 6, halfPoints: 3 }),
        "yo": Object.freeze({ fullPoints: 12, halfPoints: 6 })
    })

});

export default GAME_POINTS;