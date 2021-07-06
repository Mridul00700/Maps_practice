'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
    type = "running"
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
    type = 'cycling';
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


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class App {

    // Private Instance Property....
    #map;
    #mapEvent;
    #workouts = [];

    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkOut.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert("Could not get your position");
            });
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

        const validators = (...inputs) =>
            inputs.every(inp => Number.isFinite(inp));

        const allPositives = (...inputs) => inputs.every(inp => inp > 0);



        // Steps --> 
        /* Get data from form
        Check if data is valid 
        if activity is running / cycling then create running object / cycling object repectively..
        Add new object to workout array 
        then render the workout on the map and also on the list 
        hide the form and clear the input fields..

        */
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        if (type === "running") {
            const cadence = +inputCadence.value;
            if (!validators(distance, duration, cadence) || !allPositives(distance, duration, cadence)) return alert("Input has to be positive number!");

            workout = new Running([lat, lng], distance, duration, cadence);

        } else {
            const elevation = +inputElevation.value;
            if (!validators(distance, duration, elevation) || !allPositives(distance, duration)) return alert("Input has to be positive number!");

            workout = new CyCling([lat, lng], distance, duration, elevation);

        }
        this.#workouts.push(workout);

        // console.log(this.#workouts);
        this._renderWorkoutMarker(workout);

        this._renderWorkout(workout);

        // Clear Input fields 
        inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = "";

        // Submit the marker
        // console.log(mapEvent);

        // All the methods return this hence chainable...

    }

    _renderWorkoutMarker = (workout) => {
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({ maxWidth: 250, minWidth: 100, autoClose: false, closeOnClick: false, className: `${workout.type}-popup` }))
            .setPopupContent(`${workout.type}`).openPopup();

    }

    _renderWorkout(workout) {


        const html = `
        <li class="workout workout--${workout.name}" data-id="${workout.id}">
          <h2 class="workout__title">Running on April 14</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.name === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div >
    <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
    </div>
`
    }

}



// Object ---->>
const app = new App();




// Geolocation -- Two callbacks -->>




