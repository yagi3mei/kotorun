const params=new URLSearchParams(location.search);
const mode=params.get("mode") || "inner";

/* ★表示名 */
const modeLabel=mode==="inner" ? "うちの（わたしの）" : "ともだちの";

document.getElementById("family-mode-label").textContent=modeLabel;

const centerLabel =
        mode === "inner"
            ? "わたし"
            : "ともだち";

    document.getElementById(
        "family-center"
    ).textContent = centerLabel;

const module=
    await import(
        mode==="inner"
        ? "../data/family_inner.js"
        : "../data/family_outer.js"
    );

const data=module.default;


const mapping={
    sofu:"sofu",
    sobo:"sobo",
    chichi:"chichi",
    haha:"haha",
    ani:"ani",
    ane:"ane",
    otouto:"otouto",
    imouto:"imouto",

    ojiisan:"sofu",
    obaasan:"sobo",
    otousan:"chichi",
    okaasan:"haha",
    oniisan:"ani",
    oneesan:"ane"
};

const resultModal = document.getElementById("result-modal");

let used=[];
let wrongWords=[];

let correctAnswer=null;
let missCount=0;
let questionCount = 0;

let startTime;
let timerInterval;



const timerDisplay=
    document.getElementById(
        "timer-display"
    );

const remainingDisplay=
    document.getElementById(
        "remaining-display"
    );

const missDisplay=
    document.getElementById(
        "miss-display"
    );

const resultText=
    document.getElementById(
        "result-text"
    );



function renderCards(){

data.forEach(item=>{

const card=
    document.getElementById(
        mapping[item.id]
    );

card.innerHTML=`
    <img src="images/family/${item.img}">
    <div class="family-label">
        ${item.word}
    </div>
    `;

card.onclick=()=>{
        checkAnswer(item,card);
    };

});

}



function loadQuestion(){

    const remain=
        data.filter(
            x=>!used.includes(x.id)
        );

    remainingDisplay.textContent=
    "のこり："+remain.length;


    if(remain.length===0){
        showResult();
        return;
    }


    correctAnswer=
        remain[
            Math.floor(
                Math.random()*remain.length
            )
        ];

    used.push(
        correctAnswer.id
    );


    document.getElementById(
        "romaji-display"
        ).textContent=
        correctAnswer.romaji;


    playAudio();

}



function playAudio(){

    const u=
        new SpeechSynthesisUtterance(
        correctAnswer.sentence
        );

    u.lang="ja-JP";

    speechSynthesis.cancel();
    speechSynthesis.speak(u);

}

document
    .getElementById("sound-btn")
    .addEventListener(
    "click",
    playAudio
    );



function checkAnswer(selected, card) {

    if (selected.id === correctAnswer.id) {

        speechSynthesis.cancel();

        /* 正解音 */
        const sound = new Audio("sounds/correct.mp3");
        sound.volume = 0.4;
        sound.play();

        questionCount++;

        setTimeout(() => {
            loadQuestion();
        }, 500);

    } else {

        /* 不正解音 */
        const sound = new Audio("sounds/wrong.mp3");
        sound.volume = 0.4;
        sound.play();

        missCount++;
        missDisplay.textContent = "ミス：" + missCount;

        if (!wrongWords.includes(correctAnswer.id)) {
            wrongWords.push(correctAnswer.id);
        }

        card.style.animation = "shake 0.3s";

        setTimeout(() => {
            card.style.animation = "";
        }, 300);
    }
}

function showResult() {

    clearInterval(timerInterval);

    const endTime = performance.now();

    const time =
        (
            (endTime - startTime) / 1000
        ).toFixed(2);

    const now = new Date();

    const dateStr =
        now.toLocaleString();

    let wordList = "";

    data.forEach(item => {

        const isWrong =
            wrongWords.includes(item.id);

        const mark =
            isWrong ? "★" : "　";

        wordList += `
            ${mark} ${item.word}（${item.lesson}課）<br>
        `;
    });

    const familyLabel =
        mode === "inner"
            ? "かぞく　うちの"
            : "かぞく　ともだちの";


    resultText.innerHTML = `
        実施日時：${dateStr}<br><br>

        【${familyLabel}】<br>
        時間：${time}秒<br>
        ミス★：${missCount}回<br><br>

        ＜今回の単語＞<br>
        ${wordList}
    `;


    resultModal.classList.remove(
        "hidden"
    );
}

window.restartGame=function(){

    used=[];
    wrongWords=[];

    missCount=0;
    questionCount=0;

    missDisplay.textContent=
    "ミス：0";

    resultModal.classList.add(
        "hidden"
    );

    start();
};



window.goBack=function(){
    history.back();
};



function start(){

    startTime=
        performance.now();

    clearInterval(
        timerInterval
    );


    timerInterval=
        setInterval(()=>{

            timerDisplay.textContent=
            (
                (performance.now()-startTime)
                /1000
            ).toFixed(2);

        },50);


    loadQuestion();

}

renderCards();
start();