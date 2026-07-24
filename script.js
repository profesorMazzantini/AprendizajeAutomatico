const URL = "./model/";

let model;
let webcam;
let labelContainer;
let maxPredictions;

let lastPrediction = 0;
const UPDATE_TIME = 500; // medio segundo

async function init() {

    model = await tmImage.load(
        URL + "model.json",
        URL + "metadata.json"
    );

    maxPredictions = model.getTotalClasses();

    webcam = new tmImage.Webcam(
        window.innerWidth,
        window.innerHeight,
        true
    );

    await webcam.setup();

    await webcam.play();

    window.requestAnimationFrame(loop);

    document
        .getElementById("webcam-container")
        .appendChild(webcam.canvas);

    labelContainer = document.getElementById("label-container");

    for(let i=0;i<maxPredictions;i++){

        labelContainer.appendChild(document.createElement("div"));

    }

}

async function loop(){

    webcam.update();

    const ahora = Date.now();

    if(ahora-lastPrediction>UPDATE_TIME){

        await predict();

        lastPrediction=ahora;

    }

    window.requestAnimationFrame(loop);

}

async function predict(){

    const prediction = await model.predict(webcam.canvas);

    prediction.sort((a,b)=>b.probability-a.probability);

    for(let i=0;i<maxPredictions;i++){

        labelContainer.childNodes[i].innerHTML=

            "<b>"+prediction[i].className+"</b> : "

            +(prediction[i].probability*100).toFixed(1)

            +" %";

    }

}

init();
