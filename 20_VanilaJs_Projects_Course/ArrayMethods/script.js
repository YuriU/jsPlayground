const main = document.getElementById('main');
const addUserBtn = document.getElementById('add_user');
const doubleBtn = document.getElementById('double');
const showMilionairsBtn = document.getElementById('show_millionaires');
const sortBtn = document.getElementById('sort');
const calculateWealthBtn = document.getElementById('calculate_wealth');


let data = [];

getRandonUser();

// Fetch random user and add money
async function getRandonUser() {
    const res = await fetch('https://randomuser.me/api');
    const data = await res.json();

    const user = data.results[0];

    const newUser = {
        name: `${user.name.first} ${user.name.last}`,
        money: Math.floor(Math.random() * 1000000)
    };

    addData(newUser);
}

function doubleMoney() {
    data = data.map(user => {
        return { ...user, money: user.money * 2 };
    });

    updateDOM();
}

function addData(obj) {
    data.push(obj);

    updateDOM();
}

function sortByRichest() {
    data = data.sort((a, b) => b.money - a.money);
    updateDOM();
}

function showMilionairs() {
    data = data.filter(u => u.money > 1000000);
    updateDOM();
}

function calculateWealth() {
    const wealth = data.reduce((acc, user) => (acc + user.money), 0);

    const wealthEl = document.createElement('div');
    wealthEl.innerHTML = `<h3>Total Wealth: <strong>${formatMoney(wealth)}</strong></h3>`;
    main.appendChild(wealthEl);
}

// Update DOM
function updateDOM(providedData = data) {
    main.innerHTML ='<h2><strong>Person</strong> Wealth</h2>';

    providedData.forEach((item) => {
        const element = document.createElement('div');
        element.classList.add('person');
        element.innerHTML = `<strong>${item.name}</strong> ${formatMoney(item.money)}`;
        main.appendChild(element);
    });
}

// Format money
function formatMoney(number) {
    return '$' + number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}


// Event listeners
addUserBtn.addEventListener('click', getRandonUser);
doubleBtn.addEventListener('click', doubleMoney);
sortBtn.addEventListener('click', sortByRichest);
showMilionairsBtn.addEventListener('click', showMilionairs);
calculateWealthBtn.addEventListener('click', calculateWealth);