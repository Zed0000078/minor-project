const timeInfoContainer = document.getElementById("time-info");
const timeTextDiv = document.getElementById("time-text");
const timeSlider = document.getElementById("time-slider");
const playPauseButton = document.getElementById("play-pause-bt");
const pointerDataDiv = document.getElementById("pointer-data");
let pointerLngLat = null;

maptilersdk.config.apiKey = "5YxLKYurwdaRZ7BsjHdz";

const map = new maptilersdk.Map({
    container: document.getElementById("map"),
    hash: true,
    zoom: 2,
    center: [0, 40],
    style: maptilersdk.MapStyle.BACKDROP,
});

const layerBg = new maptilerweather.TemperatureLayer({
    opacity: 0.8,
});

const layer = new maptilerweather.WindLayer({
    id: "Wind Particles",
    colorramp: maptilerweather.ColorRamp.builtin.NULL,
    speed: 0.001,
    fadeFactor: 0.03,
    maxAmount: 256,
    density: 200,
    color: [0, 0, 0, 30],
    fastColor: [0, 0, 0, 100],
});

console.log("layer", layer);

map.on("load", function () {
    // Darkening the water layer to make the land stand out
    map.setPaintProperty("Water", "fill-color", "rgba(0, 0, 0, 0.6)");
    map.addLayer(layer);
    map.addLayer(layerBg, "Water");
});

timeSlider.addEventListener("input", (evt) => {
    layer.setAnimationTime(parseInt(timeSlider.value / 1000));
    layerBg.setAnimationTime(parseInt(timeSlider.value / 1000));
});

// Event called when all the datasource for the next days are added and ready.
// From now on, the layer nows the start and end dates.
layer.on("sourceReady", (event) => {
    const startDate = layer.getAnimationStartDate();
    const endDate = layer.getAnimationEndDate();
    const currentDate = layer.getAnimationTimeDate();
    refreshTime();

    timeSlider.min = +startDate;
    timeSlider.max = +endDate;
    timeSlider.value = +currentDate;
});

// Called when the animation is progressing
layer.on("tick", (event) => {
    refreshTime();
    updatePointerValue(pointerLngLat);
});

// Called when the time is manually set
layer.on("animationTimeSet", (event) => {
    refreshTime();
});

// When clicking on the play/pause
let isPlaying = false;
playPauseButton.addEventListener("click", () => {
    if (isPlaying) {
        layer.animateByFactor(0);
        layerBg.animateByFactor(0);
        playPauseButton.innerText = "Play 3600x";
    } else {
        layer.animateByFactor(3600);
        layerBg.animateByFactor(3600);
        playPauseButton.innerText = "Pause";
    }

    isPlaying = !isPlaying;
});

// Update the date time display
function refreshTime() {
    const d = layer.getAnimationTimeDate();
    timeTextDiv.innerText = d.toString();
    timeSlider.value = +d;
}

function updatePointerValue(lngLat) {
    if (!lngLat) return;
    pointerLngLat = lngLat;
    const valueWind = layer.pickAt(lngLat.lng, lngLat.lat);
    const valueTemp = layerBg.pickAt(lngLat.lng, lngLat.lat);
    if (!valueWind) {
        pointerDataDiv.innerText = "";
        return;
    }
    pointerDataDiv.innerText = `${valueTemp.value.toFixed(
        1
    )}°C \n ${valueWind.speedKilometersPerHour.toFixed(1)} km/h`;
}

timeInfoContainer.addEventListener("mouseenter", () => {
    pointerDataDiv.innerText = "";
});

map.on("mousemove", (e) => {
    updatePointerValue(e.lngLat);
});



