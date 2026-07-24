const URL = "./model/";

let model;
let webcam;

let lastPrediction = 0;
const UPDATE_TIME = 500;      // Analiza cada 0,5 s
const CHANGE_DELAY = 2000;    // Mantiene el resultado 2 s

let currentClass = "";
let currentProb = 0;
let lastChange = 0;

async function init() {

    model = await tmImage.load(
        URL + "model.json",
        URL + "metadata.json"
    );

    webcam = new tmImage.Webcam(
        window.innerWidth,
        window.innerHeight,
        true
    );

    await webcam.setup();
    await webcam.play();

    document
        .getElementById("webcam-container")
        .appendChild(webcam.canvas);

    window.requestAnimationFrame(loop);

}

async function loop() {

    webcam.update();

    const ahora = Date.now();

    if (ahora - lastPrediction > UPDATE_TIME) {

        await predict();

        lastPrediction = ahora;

    }

    window.requestAnimationFrame(loop);

}

async function predict() {

    const prediction = await model.predict(webcam.canvas);

    prediction.sort((a, b) => b.probability - a.probability);

    const mejorClase = prediction[0].className;
    const mejorProb = prediction[0].probability * 100;

    if (
        currentClass === "" ||
        (mejorClase !== currentClass &&
         Date.now() - lastChange > CHANGE_DELAY)
    ) {
        currentClass = mejorClase;
        currentProb = mejorProb;
        lastChange = Date.now();
    } else if (mejorClase === currentClass) {
        currentProb = mejorProb;
    }

    document.getElementById("label-container").innerHTML = `
        <div class="resultado">
            <div class="titulo">${currentClass}</div>
            <div class="porcentaje">${currentProb.toFixed(1)}%</div>
        </div>
    `;

}

init();
