/*
 * カレンダーゲーム用の日付データ
 *
 * day:
 *   日付（1～31）
 *
 * text:
 *   画面表示用。ひらがなで日付の読み方を定義する。
 *
 * speech:
 *   音声読み上げ用。
 *   基本的に漢字で定義するが、端末によって読み方が
 *   不自然になる場合は、ひらがなに変更して調整する。
 *
 * 【2026-11-18】
 * SpeechSynthesisによる読み上げは、端末によって
 * 漢字の読み方が異なることを確認。
 * また、textをそのまま読み上げても、
 * 「はつか」を「わつか」と読む端末があった。
 * そのため、読み上げにはspeechを使用し、
 * 不自然な読み方が確認された日付は個別に修正する。
 */

export default [
    {
        day: 1,
        text: "ついたち",
        speech: "ついたち"
    },
    {
        day: 2,
        text: "ふつか",
        speech: "二日"
    },
    {
        day: 3,
        text: "みっか",
        speech: "三日"
    },
    {
        day: 4,
        text: "よっか",
        speech: "四日"
    },
    {
        day: 5,
        text: "いつか",
        speech: "五日"
    },
    {
        day: 6,
        text: "むいか",
        speech: "六日"
    },
    {
        day: 7,
        text: "なのか",
        speech: "七日"
    },
    {
        day: 8,
        text: "ようか",
        speech: "八日"
    },
    {
        day: 9,
        text: "ここのか",
        speech: "九日"
    },
    {
        day: 10,
        text: "とおか",
        speech: "十日"
    },
    {
        day: 11,
        text: "じゅういちにち",
        speech: "十一日"
    },
    {
        day: 12,
        text: "じゅうににち",
        speech: "十二日"
    },
    {
        day: 13,
        text: "じゅうさんにち",
        speech: "十三日"
    },
    {
        day: 14,
        text: "じゅうよっか",
        speech: "十四日"
    },
    {
        day: 15,
        text: "じゅうごにち",
        speech: "十五日"
    },
    {
        day: 16,
        text: "じゅうろくにち",
        speech: "十六日"
    },
    {
        day: 17,
        text: "じゅうしちにち",
        speech: "じゅうしちにち"
    },
    {
        day: 18,
        text: "じゅうはちにち",
        speech: "十八日"
    },
    {
        day: 19,
        text: "じゅうくにち",
        speech: "十九日"
    },
    {
        day: 20,
        text: "はつか",
        speech: "二十日"
    },
    {
        day: 21,
        text: "にじゅういちにち",
        speech: "二十一日"
    },
    {
        day: 22,
        text: "にじゅうににち",
        speech: "二十二日"
    },
    {
        day: 23,
        text: "にじゅうさんにち",
        speech: "二十三日"
    },
    {
        day: 24,
        text: "にじゅうよっか",
        speech: "二十四日"
    },
    {
        day: 25,
        text: "にじゅうごにち",
        speech: "二十五日"
    },
    {
        day: 26,
        text: "にじゅうろくにち",
        speech: "二十六日"
    },
    {
        day: 27,
        text: "にじゅうしちにち",
        speech: "にじゅうしちにち"
    },
    {
        day: 28,
        text: "にじゅうはちにち",
        speech: "二十八日"
    },
    {
        day: 29,
        text: "にじゅうくにち",
        speech: "二十九日"
    },
    {
        day: 30,
        text: "さんじゅうにち",
        speech: "さんじゅうにち"
    },
    {
        day: 31,
        text: "さんじゅういちにち",
        speech: "三十一日"
    }
];