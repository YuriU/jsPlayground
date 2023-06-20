// Run at: https://onlinebusiness.icbc.com/webdeas-ui/home


// ng-dirty ng-touched ng-valid
const LICENSE_ID = '<>'
const LAST_NAME = '<>'
const KEY_WORD = '<>'
const NEAREST_CITY = 'Vancouver, BC'

const HOME_URL = 'https://onlinebusiness.icbc.com/webdeas-ui/home'
const LOGIN_URL = 'https://onlinebusiness.icbc.com/webdeas-ui/login;type=driver'
const DRIVER_PAGE_URL = 'https://onlinebusiness.icbc.com/webdeas-ui/driver'
const BOOKING_PAGE_URL = 'https://onlinebusiness.icbc.com/webdeas-ui/booking'

const TIMER_INTERVAL = 1000;

let formFilled = false;
let rescheduleClicked = false;
let bookingSetCity = false;
let ifDropBoxConfirmed = false;

async function dispatch() {
    console.log(getCurrentURL())
    if (HOME_URL === getCurrentURL()) {
        const button = findButtonByClass("mat-button-wrapper")
        formFilled = false;
        button.click()
    }
    else if(LOGIN_URL === getCurrentURL()) {
        if(!formFilled) {

            setValue(findInputByAreaLabel('driver-name'), LAST_NAME)
            setValue(findInputByAreaLabel('driver-licence'), LICENSE_ID)
            setValue(findInputByAreaLabel('keyword'), KEY_WORD)    
            findCheckbox().click()

            
            formFilled = true
        } else {
            const signIn = findButtonByClassAndText("mat-button-wrapper", "Sign in")
            formFilled = false;
            signIn.click()
        }   
    }
    else if(DRIVER_PAGE_URL === getCurrentURL()) { 
        if (!rescheduleClicked) {
            const reschedule = findButtonByClassAndText("mat-button-wrapper", "Reschedule appointment")
            reschedule.click()
            rescheduleClicked = true
        } else {
            const yesButton = findButtonByClassAndText("mat-button-wrapper", "Yes")
            rescheduleClicked = false
            yesButton.click()
        }
    }
    else if(BOOKING_PAGE_URL === getCurrentURL()) { 
        const areaInput = findInputByAreaLabel("Number")

        if(!bookingSetCity) {    
            setValue(areaInput, NEAREST_CITY)
            areaInput.dispatchEvent(new KeyboardEvent('keyup', {bubbles: true, key: 'KeySpace', keyCode: 32, isTrusted:true}))
            areaInput.dispatchEvent(new Event('focusin', {}))
            bookingSetCity = true;
        }
        else {

            if(!ifDropBoxConfirmed) {
                confirmChoiseInDropDown(NEAREST_CITY)
                const searchButton = findButtonByClassAndText("mat-button-wrapper", "Search")
                searchButton.click()
                const driverProfile = await getDriverProfile(LAST_NAME, LICENSE_ID)
                console.log(driverProfile)
                ifDropBoxConfirmed = true
            } else {
                
            }
            
        }
        
        /*const event = new KeyboardEvent('keypress', {
            key: 'Space',  // Specify the key you want to emulate
            keyCode: 32,   // Specify the key code (optional)
            bubbles: true
          });

          areaInput.focus()
          areaInput.dispatchEvent(event)
          const keyDownEvent = new KeyboardEvent('keydown', {
            key: 'Space',
            keyCode: 32,
            bubbles: true
          });
          areaInput.dispatchEvent(keyDownEvent)

          const keyUpEvent = new KeyboardEvent('keyup', {
            key: 'Space',
            keyCode: 32,
            bubbles: true
          });
          areaInput.dispatchEvent(keyUpEvent)*/
    }
    else {
        console.log(getCurrentURL())
        
        

        //window.location.href = HOME_URL
    }
    
    
    console.log()
}

function confirmChoiseInDropDown(text) {
    let listBox = document.getElementById('mat-autocomplete-0')
    for (let i = 0; i< listBox.childNodes.length; i++) {
        const node = listBox.childNodes[i];
        
        if (node.nodeName == 'MAT-OPTION') {
            const childSpan = node.querySelector('.mat-option-text')
            if(childSpan.innerText.trim() === text) {
                node.click()
                return
            }
            
        }
    }
}

function setCheckboxValue(element, isChecked) {
    element.checked = isChecked;
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
}

function setValue(element, value) {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
}

function getCurrentURL () {
    return window.location.href
}

function findButtonByClass(buttonClass) {
    const collection = document.getElementsByClassName(buttonClass);
    if (collection.length == 0) {
        console.error('Collection is empty')
        return undefined
    }

    const textSpan = collection[0];
    const parentButton = textSpan.parentElement;

    if (parentButton.nodeName == 'BUTTON') {
        return parentButton;
    } else {
        console.error('Invalid element type')
    }
}

function findButtonByClassAndText(buttonClass, text) {
    const collection = document.getElementsByClassName(buttonClass);
    if (collection.length == 0) {
        console.error('Collection is empty')
        return undefined
    }

    let buttonLable = undefined
    for (let i = 0; i< collection.length; i++) {
        let textSpan = collection[i];
        console.log(textSpan.textContent.trim())
        if(textSpan.textContent.trim() == text) {

            buttonLable = textSpan
            break
        }
    }

    if (buttonLable == undefined) {
        console.error('Collection is empty')
        return undefined
    }
    
    const parentButton = buttonLable.parentElement;

    if (parentButton.nodeName == 'BUTTON') {
        return parentButton;
    } else {
        console.error('Invalid element type')
    }
}

function findInputByAreaLabel(label) {
    const collection = document.getElementsByTagName('input')
    //console.log(collection)
    for (let i = 0; i< collection.length; i++) {
        
        if(collection[i].ariaLabel == label) {
            return collection[i]
        }
    }
}

function findCheckbox() {
    const collection = document.getElementsByTagName('input')
    for (let i = 0; i< collection.length; i++) {
        
        if(collection[i].type == 'checkbox') {
            return collection[i]
        }
    }
}

async function getDriverProfile(driverLastName, licence) {
    const response = await fetch('https://onlinebusiness.icbc.com/deas-api/v1/web/driver', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "Expires": "0",
            "pragma": "no-cache",
            "Cache-control": "no-cache, no-store",
            Authorization: localStorage.getItem("AUTH_TOKEN")
        },
        body: JSON.stringify({
            drvrLastName: driverLastName,
            licenceNumber: licence
        })
    })
    return response.json();
}

const interval = setInterval(dispatch, TIMER_INTERVAL)