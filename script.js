'use strict';



//  OOP Implementation...
// Implementing App Class...>>>


// Child Classes ---->>>>>

class Workout {

    date = new Date();
    // new unique ID
    id = (Date.now() + "").slice(-10);
    clicks = 0;

    constructor(coords, distance, duration) {
        this.coords = coords;  // [] of coordinated [lat, lng]
        this.distance = distance;
        this.duration = duration;
    }

    _setDescription() {

        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
    click() {
        this.clicks++;
    }
}

class Running extends Workout {
    type = "running"
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();

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
        this._setDescription();

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
    #mapZoomLvl = 13;
    #mapEvent;
    #workouts = [];

    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkOut.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
        this.#map = L.map('map').setView(coords, this.#mapZoomLvl);

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

    _hideForm() {
        // Empty input
        inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = "";
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1000);
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
        this._hideForm();


        // Submit the marker
        // console.log(mapEvent);

        // All the methods return this hence chainable...

    }

    _renderWorkoutMarker = (workout) => {
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({ maxWidth: 250, minWidth: 100, autoClose: false, closeOnClick: false, className: `${workout.type}-popup` }))
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`).openPopup();

    }

    _renderWorkout(workout) {

        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div >
          <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
          </div>
        `;
        if (workout.type === 'running') {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
            </div>
        </li>`
        }
        if (workout.type === 'cycling') {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
            </div>
        </li>`
        }

        form.insertAdjacentHTML('afterend', html);
    }

    _moveToPopup(e) {
        const workoutEl = e.target.closest('.workout');
        console.log(workoutEl);
        if (!workoutEl) return;

        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
        console.log(workout);
        // Its leaplet's function to center map to a particular place
        this.#map.setView(workout.coords, this.#mapZoomLvl, {
            animate: true,
            pan: {
                duration: 1
            }
        });

        // using public interface;
        workout.click();
    }
}



// Object ---->>
const app = new App();




// Geolocation -- Two callbacks -->>




