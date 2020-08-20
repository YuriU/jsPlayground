const days = document.getElementById('days');
const hours = document.getElementById('hours');
const minutes = document.getElementById('minutes');
const seconds = document.getElementById('seconds');
const countdown = document.getElementById('countdown');
const year = document.getElementById('year');
const loading = document.getElementById('loading');

const currentYear = new Date().getFullYear();
const newYearTime = new Date(`January 01 ${currentYear+1} 00:00:00`);

// Set bagkgroun year
year.innerText = currentYear + 1;

function updateCountdown() {
    const currentTime = new Date();
    const diff = newYearTime - currentTime;

    const d = Math.floor(diff / 24 / 60 / 60 / 1000);
    const h = Math.floor(diff / 60 / 60 / 1000) % 24;
    const m = Math.floor(diff / 60 / 1000) % 60;
    const s = Math.floor(diff / 1000) % 60;


    days.innerHTML = d;
    hours.innerHTML = h < 10 ? '0' + h : h;
    minutes.innerHTML = m < 10 ? '0' + m : m;
    seconds.innerHTML = s < 10 ? '0' + s : s;
}

setInterval(updateCountdown, 1000);
setTimeout(() => {
    loading.style.display = 'none';
    countdown.style.display = 'flex';
}, 1000);