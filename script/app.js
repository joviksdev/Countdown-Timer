const eventForm = document.querySelector('.timer-form');
const btnSubmit = document.querySelector('.btn-submit ');
const eventName = document.querySelector('.event-name');
const eventDate = document.querySelector('.event-date');
const eventTime = document.querySelector('.event-time');
const eventNameLabel = document.querySelector('.label-event-name');
const eventDateLabel = document.querySelector('.label-event-date');
const eventTimeLabel = document.querySelector('.label-event-time');
const dateError = document.querySelector('.date-error');
const htmlTime = document.querySelector('.countdown-timer-wrapper');

const alert = document.querySelector('.alert');
const footer = document.querySelector('.user-details');
const header = document.querySelector('header');
const confirm = document.querySelector('.confirm');
const overlay = document.querySelector('.overlay');
const switchMode = document.querySelector('.switch-toggle');
const switchModeWrapper = document.querySelector('.switch-mode-wrapper');
const appTitle = document.querySelector('.app-title');
const switchTitle = document.querySelector('.switch-title');
const body = document.querySelector('body');

// Check Local Storage for Saved Events

document.addEventListener('DOMContentLoaded', () => {
  const event = getEventFromStorage();

  if (event) {
    event.forEach(value => {
      displayCounter(value);
      hideDisplayBtn();
    });
  }
});

// Handle Submitted Form

eventForm.addEventListener('submit', handleForm);

function handleForm(e) {
  e.preventDefault();

  if (isNameValidate(eventName.value) && isDateValidate(eventDate.value)) {
    const setTime = eventTime.value ? eventTime.value : '24:00';

    const getDate = new Date(`${eventDate.value} ${setTime}`);
    const parseDate = Date.parse(getDate);

    const event = {
      id: genId(),
      name: eventName.value,
      date: parseDate,
      time: setTime,
      isSave: false
    };

    displayCounter(event);

    // Reset Form
    e.target.reset();
  }
}

// Display Counter

let events = [];

function displayCounter(event) {
  const { id, name, date } = event;

  events.push(event);

  let setTime;

  events.forEach(event => {
    const hrs = parseInt(event.time.substr(0, 2));
    const mins = parseInt(event.time.substr(3, 4));

    setTime = hrs > 12 ? `${Math.abs(hrs - 12)}:${mins}PM` : `${hrs}:${mins}AM`;
  });

  const htmlDiv = `
    <div class='count-down' >
      <h3>Countdown</h3>
      <div class='date-time'>
        <p class='counter-date'>${handleDate(date)}</p>
        <p class='small-circle'>&#9899;</p>
        <p class=''>${setTime}</p>
      </div>
      <div class='event'>
        <p class='small-check'>&#9745;</p>
        <p class='event-name'>${name}</p>
      </div>
      <p class='counter-time' id=${id}>...</p>
      <div>
        <button class='btn btn-save' id=${id} >save</button>
        <button class='btn btn-delete hide' id=${id}>delete</button>
      </div>
    </div>
  `;

  htmlTime.innerHTML += htmlDiv;
  const displayCounters = document.querySelectorAll('.counter-time');

  events.forEach(event => {
    const countDownTimer = setInterval(() => {
      const { days, hours, minutes, seconds } = timeDiffcalc(event.date);

      const counter = `${days > 0 ? days + 'days' : ''} ${
        hours > 0 ? hours + 'h' : ''
      } ${minutes > 0 ? minutes + 'm' : ''} ${seconds > 0 ? seconds + 's' : ''}
      `;

      displayCounters.forEach(displayCounter => {
        if (parseInt(displayCounter.id) === event.id) {
          displayCounter.innerHTML = counter;
        }
      });

      const todayDate = Date.now();

      if (todayDate >= event.date) {
        const eventEndMsg = `
        <div class='confirm-msg'>
          <p>Event "${event.name}" is due</p>
          <p>Date: ${handleDate(date)}</p>
          <p>Time: ${setTime}</p>
          <div>
        <button class='btn close'>close</button>
      </div>
        </div>
        `;

        confirm.innerHTML = eventEndMsg;
        displayCounters.forEach(displayCounter => {
          displayCounter.innerHTML = 'Even is due';
        });
        overlay.classList.remove('hide');
        hideDisplayBtn();
        clearInterval(countDownTimer);

        const removeMsg = document.querySelector('.close');
        removeMsg.addEventListener('click', () => {
          confirm.innerHTML = '';
          overlay.classList.add('hide');
        });
      }
    });
  }, 1000);

  saveEvent(event);
  deleteEvent();
}

// Handle Date

function handleDate(dateCounter) {
  const counterDay = new Date(dateCounter).getDay();
  const counterDate = new Date(dateCounter).getDate();
  const countermonth = new Date(dateCounter).getMonth();
  const counterYear = new Date(dateCounter).getFullYear();

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  const months = [
    'January',
    'Febuary',
    'March',
    'April',
    'May',
    'June',
    'july',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const displayDate = `${days[counterDay]} ${counterDate} ${months[countermonth]}, ${counterYear}`;

  return displayDate;
}

// Hide Save Button and Diplay Delete Button

function hideDisplayBtn() {
  const delBtn = document.querySelectorAll('.btn-delete');
  const saveBtn = document.querySelectorAll('.btn-save');
  delBtn.forEach(btn => {
    btn.classList.remove('hide');
  });
  saveBtn.forEach(btn => {
    btn.classList.add('hide');
  });
}

// Save Event
let saveEvents = [];

function saveEvent(event) {
  const saveBtn = [...document.querySelectorAll('.btn-save')];

  event.isSave = true;
  saveEvents.push(event);

  saveBtn.forEach(btn => {
    btn.addEventListener('click', e => {
      let eventFromStorage = getEventFromStorage();

      if (eventFromStorage) {
        const val = saveEvents.filter(
          value => value.id === parseInt(e.target.id)
        )[0];
        eventFromStorage = [...eventFromStorage, val];
        localStorage.setItem('event', JSON.stringify(eventFromStorage));
        displayAlert('success', `Event saved successfully`);
      } else {
        const val = saveEvents.filter(
          value => value.id === parseInt(e.target.id)
        );

        localStorage.setItem('event', JSON.stringify(val));
        displayAlert('success', `Event saved successfully`);
      }

      e.target.style.display = 'none';
      e.target.nextElementSibling.style.display = 'inline-block';
    });
  });
}

// Delete Event
function deleteEvent() {
  const deleteBtns = document.querySelectorAll('.btn-delete');

  deleteBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      confirmDel();

      const deleteBtn = document.querySelector('.delete');
      const cancelBtn = document.querySelector('.cancel');

      deleteBtn.addEventListener('click', () => {
        let events = getEventFromStorage();
        events = events.filter(event => event.id !== parseInt(e.target.id));
        localStorage.setItem('event', JSON.stringify(events));

        e.target.parentElement.parentElement.parentElement.removeChild(
          e.target.parentElement.parentElement
        );

        confirm.innerHTML = '';
        overlay.classList.add('hide');
      });
      cancelBtn.addEventListener('click', () => {
        overlay.classList.add('hide');
        confirm.innerHTML = '';
      });
    });
  });
}

// Comfirm Delete

function confirmDel() {
  const confirmDelete = `
    <div class='confirm-delete'>
      <p>Delete this event</p>
      <div>
        <button class='btn cancel'>cancel</button>
        <button class='btn delete'>delete</button>
      </div>
    </div>
  `;

  confirm.innerHTML = confirmDelete;

  overlay.classList.remove('hide');
}

// Get Event From Storage
function getEventFromStorage() {
  return JSON.parse(localStorage.getItem('event'));
}

// Validate Event Name

function isNameValidate(name) {
  const regExp = /[a-zA-Z]{30}/;

  if (name === '') {
    eventNameLabel.textContent = 'Please enter an event';
    return false;
  } else if (name.length > 30) {
    eventNameLabel.textContent = 'Please enter a maximum of 30 characters';
    eventNameLabel.style.color = 'red';
  } else {
    return true;
  }
}

// Validate Event Date

function isDateValidate(date) {
  const eventDate = Date.parse(`${date} 24:00`);
  const todayDate = Date.now();

  if (date === '') {
    dateError.textContent = 'Please specify a date';
    return false;
  } else if (todayDate > eventDate) {
    dateError.textContent = 'Invalid date';
  } else {
    dateError.textContent = '';

    return true;
  }
}

// Calculate Different in Days, Hours, Minutes, Seconds.

function timeDiffcalc(date) {
  const todayDate = Date.now();

  let diffInMilliseconds = Math.abs(todayDate - date) / 1000;

  // Calculate days
  const days = Math.floor(diffInMilliseconds / 86400);
  diffInMilliseconds -= days * 86400;

  // Calculate hours
  const hours = Math.floor(diffInMilliseconds / 3600);
  diffInMilliseconds -= hours * 3600;

  // Calculate Minutes
  const minutes = Math.floor(diffInMilliseconds / 60);
  diffInMilliseconds -= minutes * 60;

  // Calculate Seconds
  const seconds = Math.floor(diffInMilliseconds);

  return { days, hours, minutes, seconds };
}

// Generate Id
function genId() {
  const id = Math.floor(Math.random() * 10 ** 10);

  return id;
}

// Alert

function displayAlert(type, msg) {
  alert.innerHTML = `<p class=${type}>${msg}</p>`;

  setTimeout(() => {
    alert.innerHTML = '';
  }, 2000);
}

/* Switch Mode */

switchMode.addEventListener('click', e => {
  const countDown = document.querySelectorAll('div.count-down');
  const event_name = document.querySelectorAll('.event-name');

  if (e.target.checked) {
    body.classList.add('dark-theme');
    switchModeWrapper.classList.add('wrapper-theme');
    appTitle.classList.add('light-blue');
    switchTitle.classList.add('light-blue');
    eventForm.classList.add('timer-form-dark');
    eventName.classList.add('inputText-light-theme');
    eventNameLabel.classList.add('light-blue');
    eventDate.classList.add('light-blue');
    eventTime.classList.add('light-blue');
    eventDateLabel.classList.add('light-blue');
    eventTimeLabel.classList.add('light-blue');
    btnSubmit.classList.add('light-bgColor');
    footer.classList.add('light-blue');
    header.classList.add('no-bg');

    countDown.forEach(count => {
      count.classList.add('count-down-light');
    });
    event_name.forEach(name => {
      name.classList.add('dark-blue');
    });
  } else {
    body.classList.remove('dark-theme');
    switchModeWrapper.classList.remove('wrapper-theme');
    appTitle.classList.remove('light-blue');
    switchTitle.classList.remove('light-blue');
    eventForm.classList.remove('timer-form-dark');
    eventName.classList.remove('inputText-light-theme');
    eventNameLabel.classList.remove('light-blue');
    eventDate.classList.remove('light-blue');
    eventTime.classList.remove('light-blue');
    eventDateLabel.classList.remove('light-blue');
    eventTimeLabel.classList.remove('light-blue');
    btnSubmit.classList.remove('light-bgColor');
    footer.classList.remove('light-blue');
    header.classList.remove('no-bg');

    countDown.forEach(count => {
      count.classList.remove('count-down-light');
    });
    event_name.forEach(name => {
      name.classList.remove('dark-blue');
    });
  }
});
