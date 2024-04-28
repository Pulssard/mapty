'use strict';


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let editWorkout;
let deleteWorkout;
const resetWorkouts = document.querySelector('.reset');
const mapContainer = document.querySelector('#map');
let map, mapEvent;

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    
    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
        
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout{
    type = 'running';
    constructor(coords,distance,duration,cadence){
        super(coords, distance,duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }
    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}
class Cycling extends Workout{
    type = 'cycling';
    constructor(coords,distance,duration,elevation){
        super(coords, distance,duration);
        this.elevation = elevation;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

class App {
    #map;
    #mapEvent;
    #workouts = [];
    #mapZoom = 13;
    constructor() {

        //get user position
        this._getPosition();

        //get data from local storage
        this._getLocalStorage();

        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._movePopup.bind(this));
        
    }

    _getPosition(){ 
        if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
                alert('Could not get your position!');
            }
        );
    }

    _loadMap(position){
            const lat = position.coords.latitude;
            const long = position.coords.longitude;
            const coords = [lat, long];
            this.#map = L.map('map').setView(coords, this.#mapZoom);
        
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
        
            this.#map.on('click', this._showForm.bind(this));
            
            this.#workouts.forEach(work => {
                this._renderWorkoutMarker(work);
            })
    }
    _showForm(mapE, workout){
        console.log(mapE)
        this.#mapEvent = mapE;
        if(workout) form.querySelector('.form__input--distance').value = workout.distance;
        if(workout) form.querySelector('.form__input--duration').value = workout.duration;
        if(workout) form.querySelector('.form__input--cadence').value = workout.cadence;
        if(workout) form.querySelector('.form__input--elevation').value = workout.elevation;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm(){
        //hide form and clear inputs
        inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1000)
    }

    _toggleElevationField(){
        inputElevation.closest('.form__row')
            .classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row')
            .classList.toggle('form__row--hidden');
    }

    _newWorkout(e){
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);
        e.preventDefault();
        
        //get data from the form
        const type = inputType.value;
        const distance = +inputDistance.value; //converting a string to a number using + operator
        const duration = +inputDuration.value;

        let {lat, lng} = this.#mapEvent.latlng;

        let workout;
        //if workout is running, create a running object
        if(type === 'running'){
            const cadence = +inputCadence.value;
            //check if data is valid
            if(!validInputs(distance,duration,cadence) || !allPositive(distance,duration,cadence)) 
                return alert('Inputs have to be positive numbers!');
            
            workout = new Running([lat,lng], distance, duration, cadence);    
        }

        //if workout is cycling, create a cycling object
        if(type === 'cycling'){
            const elevation = +inputElevation.value;

            if(!validInputs(distance,duration,elevation) || !allPositive(distance,duration))
                return alert('Inputs have to be positive numbers!');
                workout = new Cycling([lat,lng], distance, duration, elevation);
        }


        this.#workouts.push(workout);

        //render the workout on map as marker
        this._renderWorkoutMarker(workout);
        
        //render workout on a list
        this._renderWorkout(workout);

        this._hideForm();
        
        //set local storage to all workouts
        this._setLocalStorage();
        
    }
       
    
    _renderWorkoutMarker(workout){
        L.marker(workout.coords || [lat, lng])
        .addTo(this.#map)
        .bindPopup(L.popup({
            maxWidh: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`, 
        }))
        .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
        .openPopup();
    }

    _renderWorkout(workout) {
        let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                    <span class="workout__value">${workout.distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workout.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
        `;

        if(workout.type === 'running'){
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
        `;
        }
        if(workout.type === 'cycling'){
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevation}</span>
                <span class="workout__unit">m</span>
            </div>
        `;
        }

        html += `
            <div class="workout_btn-container">
                <button class="workout_btn edit" type="button">&#9998;</button>
                <button class="workout_btn delete" type="button">&#10005;</button>
            </div>
            </li>          
        `;

        form.insertAdjacentHTML('afterend', html);
        editWorkout = document.querySelector('.edit');
        editWorkout.addEventListener('click', this._editWorkout.bind(this))
        deleteWorkout = document.querySelector('.delete');
        deleteWorkout.addEventListener('click', this.deleteWorkout.bind(this));
    }

    _movePopup(e) {
        const workoutEl = e.target.closest('.workout');
        if(!workoutEl || e.target.classList.contains('workout_btn')) return;
        
        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);
        this.#map.setView(workout.coords, this.#mapZoom, {
            animate: true,
            pan: {
                duration: 1,
            },
        });
    }
    //preserving the data between sessons using local storage API.
    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'));
        
        if(!data) return;

        this.#workouts = data;

        this.#workouts.forEach(work => {
            this._renderWorkout(work);
        })
    }
    
    deleteWorkout(e) {
        e.preventDefault();
        const id = e.target.closest('.workout').dataset.id
        const filteredWorkouts = this.#workouts.filter(work => work.id !== id)
        this.#workouts = filteredWorkouts;
        this._setLocalStorage();
        this.updateWorkouts();
  
    }

    updateWorkouts(){
        const liElements = containerWorkouts.querySelectorAll('li');
        liElements.forEach(el => el.remove());
        mapContainer.querySelector('.leaflet-popup-pane').innerHTML = '';
        mapContainer.querySelector('.leaflet-marker-pane').innerHTML = '';
        mapContainer.querySelector('.leaflet-shadow-pane').innerHTML = '';
        this._getLocalStorage();

        this.#workouts.forEach(work => {
            this._renderWorkoutMarker(work);
        })
    }

    _editWorkout(e) {
            const id = e.target.closest('.workout').dataset.id;
            const workout = this.#workouts.find(work => work.id === id);
            console.log(workout)
            this._showForm(this.#mapEvent, workout);
            this.deleteWorkout(e);
    } 

    reset() {
        localStorage.removeItem('workouts');
        location.reload();
    }
}

const app = new App();


