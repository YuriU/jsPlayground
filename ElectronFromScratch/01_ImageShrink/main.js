const { app, BrowserWindow, Menu, globalShortcut, ipcMain } = require('electron');

process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';

let mainWindow; 
let aboutWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: isDev ? 700 : 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        webPreferences: {
            nodeIntegration: true
        }
    });

    if(isDev) {
        mainWindow.webContents.openDevTools();
    }

    //mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    mainWindow.loadFile(`./app/index.html`);
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        title: 'About ImageShrink',
        width: 300,
        height: 300,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: false,
        backgroundColor: 'white'
    });

    //mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    aboutWindow.loadFile(`./app/about.html`);
}

const menu = [
    ...(isMac ? [
        {
            label: app.name,
            submenu: [
                {
                    label: 'About',
                    click: () => { createAboutWindow() }
                }
            ]
        }] 
        : []),
        {
            role: 'fileMenu'
        },
        ... (!isMac ? [
                {
                    label: 'Help',
                    submenu: [
                        {
                            label: 'About',
                            click: () => { createAboutWindow(); }
                        }
                    ]
                }
        ]: 
        []),
        ... (isDev ? [
            {
                label: 'Developer',
                submenu: [
                    { role: 'reload'},
                    { role: 'forcereload'},
                    { type: 'separator'},
                    { role: 'toggledevtools'}
                ]
            }
        ] : [])
]


app.on('ready', () => {
    createMainWindow();
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    /*globalShortcut.register('CmdOrCtrl+R', () => { mainWindow.reload();});
    globalShortcut.register('CmdOrCtrl+I', () => { mainWindow.toggleDevTools();});*/

    mainWindow.on('closed', () => mainWindow = null);
});

ipcMain.on('image:minimize', (e, options) => {
    console.log(options);
});

app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
  })
  
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
  })