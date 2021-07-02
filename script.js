'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//  OOP Implementation...
// Implementing App Class...>>>


// Child Classes ---->>>>>

class Workout {

    date = new Date();
    // new unique ID
    id = (Date.now() + "").slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;  // [] of coordinated [lat, lng]
        this.distance = distance;
        this.duration = duration
    }
}

class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace() {
        // min/km = pace = time(min) / distance (km)
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}
class CyCling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }
    calcSpeed() {
        //  Km / Hr
        this.speed = (this.distance) / (this.duration / 60);
        return this.speed;
    }

}

// Sample - Example-->
// const run1 = new Running([23, 45], 20, 75, 190);
// const cycle1 = new CyCling([22, 43], 45, 145, 1023);

// console.log(run1);
// console.log(cycle1);




// /////////////////////////////////////////////
//  Application architechture -->>>

class App {

    // Private Instance Property....
    #map;
    #mapEvent;


    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkOut.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert("Could not get your position");
            })
        }
    }

    _loadMap(position) {

        // console.log(position);
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        // console.log(latitude, longitude);
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

        const coords = [latitude, longitude];
        console.log(this);
        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // console.log(map); Handling clicks on map
        this.#map.on('click', this._showForm.bind(this));
    };

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField() {

        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');

    }

    _newWorkOut(e) {
        e.preventDefault();

        // Clear Input fields 
        inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = "";

        // Submit the marker
        // console.log(mapEvent);
        const { lat, lng } = this.#mapEvent.latlng;
        // All the methods return this hence chainable...
        L.marker([lat, lng]).addTo(this.#map)
            .bindPopup(L.popup({ maxWidth: 250, minWidth: 100, autoClose: false, closeOnClick: false, className: 'running-popup' }))
            .setPopupContent("Workout").openPopup();
    }
}







// Object ---->>
const app = new App();




// Geolocation -- Two callbacks -->>




