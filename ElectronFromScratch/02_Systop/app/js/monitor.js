const path = require('path');
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverload = 80;
let alertFrequency = 1;



setInterval(() => {
    cpu.usage().then(info => {
        document.getElementById('cpu-usage').innerText = info + '%';
        document.getElementById('cpu-progress').style.width = info + '%';

        if(info >= cpuOverload) {
            document.getElementById('cpu-progress').style.background = 'red';
        }
        else {
            document.getElementById('cpu-progress').style.background = '#30c88b';
        }

        if(info >= cpuOverload && runNotify(alertFrequency)) {
            notifyUser({
                title : 'CPU Overload',
                body: `CPU is over ${cpuOverload}%`,
                icon: path.join(__dirname, 'img', 'icon.png')
            });

            localStorage.setItem('lastNotify', +new Date());
        }
    });

    cpu.free().then(info => {
        document.getElementById('cpu-free').innerText = info + '%';
    });

    document.getElementById('sys-uptime').innerText = secondsToDhms(os.uptime());

}, 2000);

document.getElementById('cpu-model').innerText = cpu.model();
document.getElementById('comp-name').innerText = os.hostname();
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`;
mem.info().then(info => document.getElementById('mem-total').innerText = info.totalMemMb);


function secondsToDhms(seconds) {
    seconds = +seconds;
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    return `${d}d, ${h}h, ${m}m, ${s}s`;
}

function notifyUser(options) {
    new Notification(options.title, options)
}

function runNotify(frequency) {
    if(localStorage.getItem('lastNotify') === null){
        localStorage.setItem('lastNotify', +new Date());
        return true;
    }
    else{
        const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')));
        const now = new Date();
        const diffTime = Math.abs(now - notifyTime);
        const minutesPassed = Math.ceil(diffTime / (1000 * 60));
        return minutesPassed > frequency;
    }
}