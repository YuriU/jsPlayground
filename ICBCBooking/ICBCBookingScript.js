// Run at: https://onlinebusiness.icbc.com/webdeas-ui/home


// ng-dirty ng-touched ng-valid
const LICENSE_ID = '<>>'
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

let driverProfile = null;
let nearestAddressesInfo = null;
let nearestLocations = null

const urlToFunction = {
    'https://onlinebusiness.icbc.com/webdeas-ui/home' : processHomePage,
    'https://onlinebusiness.icbc.com/webdeas-ui/login;type=driver': processLoginPage,
    'https://onlinebusiness.icbc.com/webdeas-ui/driver': processDriverPage,
    'https://onlinebusiness.icbc.com/webdeas-ui/booking': processBookingPage
}


let prevCall = null
async function dispatch2() {
    const url = getCurrentURL();
    const handler = urlToFunction[url];
    if(handler == null) {
        console.log('Default handler')
        return
    }

    if (prevCall == null || prevCall.url != url) {
        const result = await handler(null)
        //console.log(result)
        prevCall = {
            url: url,
            result: result,
            time: Date.now()
        }
        //console.log(prevCall)
        return;
    } else {
        const now = Date.now()
        if (prevCall.result != null 
            && prevCall.result.secondsTimeout != null
            && Math.floor((now - prevCall.time) / 1000) < prevCall.result.secondsTimeout) {
                return;
            }

        const result = await handler(prevCall.result.status)
        //console.log(result)
        prevCall = {
            url: url,
            result: result != null ? result : prevCall.result,
            time: Date.now()
        }
        //console.log(prevCall)
    }
}

async function processHomePage(prevState) {
    const button = findButtonByClass("mat-button-wrapper")
    formFilled = false;
    button.click()
    return (result(null, 1))
}

async function processLoginPage(prevState) {
    if (prevState == null) {
        setValue(findInputByAreaLabel('driver-name'), LAST_NAME)
        setValue(findInputByAreaLabel('driver-licence'), LICENSE_ID)
        setValue(findInputByAreaLabel('keyword'), KEY_WORD)    
        findCheckbox().click()
        return result('FormFilled', 1)
    } 
    else if(prevState == 'FormFilled') {
        const signIn = findButtonByClassAndText("mat-button-wrapper", "Sign in")
        formFilled = false;
        signIn.click()
        return result('Done', null)
    }
    else {
        console.error('Unknown state')
    }
}

async function processDriverPage(prevState) {
    if (prevState == null) {
        const reschedule = findButtonByClassAndText("mat-button-wrapper", "Reschedule appointment")
        reschedule.click()
        return result('rescheduleClicked', 1);
    }

    if (prevState == 'rescheduleClicked') {
        const yesButton = findButtonByClassAndText("mat-button-wrapper", "Yes")
        yesButton.click()
        return result('Done', null)
    }
}

async function processBookingPage(prevState) {
    if (prevState == null) {
        const areaInput = findInputByAreaLabel("Number")
        setValue(areaInput, NEAREST_CITY)
        areaInput.dispatchEvent(new KeyboardEvent('keyup', {bubbles: true, key: 'KeySpace', keyCode: 32, isTrusted:true}))
        areaInput.dispatchEvent(new Event('focusin', {}))
        return result('CitySelected', 1)
    }

    if (prevState == 'CitySelected') {
        confirmChoiseInDropDown(NEAREST_CITY)
        const searchButton = findButtonByClassAndText("mat-button-wrapper", "Search")
        searchButton.click()
        return result('LocationsSelected', 1)
    }

    if (prevState == 'LocationsSelected') {
        driverProfile = await getDriverProfile(LAST_NAME, LICENSE_ID)
        let nearestAddresses = await getNearestAddresses(NEAREST_CITY)
        nearestAddresses.features.forEach((feature) => {
            if (feature.properties.fullAddress.trim() == NEAREST_CITY) {
                nearestAddressesInfo = feature;
            }
        });
        [lng, lat] = nearestAddressesInfo.geometry.coordinates;
        nearestLocations = await getNearestPositions(lng, lat, driverProfile.eligibleExams[0].code, driverProfile.eligibleExams[0].eed.date)
        console.log(nearestLocations)
        return result('LocationsLoaded' , 1)
    }

    if (prevState == 'LocationsLoaded') {
        const elements = document.getElementsByClassName('department-container');
        for (let i = 0; i< elements.length; i++) {
            const departmentNode = elements[i];
            const titleNode = departmentNode.querySelector('.department-title');

            let agency = null
            for(let j = 0; j< nearestLocations.length; j++) {
                console.log(nearestLocations[j].pos.agency)
                if(nearestLocations[j].pos.agency == titleNode.innerText.trim()) {
                    agency = nearestLocations[j]
                }
            }

            const node = document.createElement('div')
            node.style.border = "thick solid #FF0000"
            node.style.width ="200px";
            node.style.height ="50px";
            node.innerText = agency.pos.posId;
            departmentNode.appendChild(node)
        }
        return result('MarkersAdded', 1)
    }
}

function result(status, secondsTimeout) {
    return { status: status, secondsTimeout: secondsTimeout }
}

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
            driverProfile = await getDriverProfile(LAST_NAME, LICENSE_ID)
            setValue(areaInput, NEAREST_CITY)
            areaInput.dispatchEvent(new KeyboardEvent('keyup', {bubbles: true, key: 'KeySpace', keyCode: 32, isTrusted:true}))
            areaInput.dispatchEvent(new Event('focusin', {}))
            bookingSetCity = true;
        }
        else {
            if(!ifDropBoxConfirmed) {
                confirmChoiseInDropDown(NEAREST_CITY)
                let nearestAddresses = await getNearestAddresses(NEAREST_CITY)
                nearestAddresses.features.forEach((feature) => {
                    if (feature.properties.fullAddress.trim() == NEAREST_CITY) {
                        nearestAddressesInfo = feature;
                    }
                });

                const searchButton = findButtonByClassAndText("mat-button-wrapper", "Search")
                searchButton.click()
                ifDropBoxConfirmed = true
                console.log(driverProfile)
            } else {
                if(driverProfile.eligibleExams.length == 0) {
                    console.log("Your are not eligible for road test")
                } else {
                    let existingAppointment = driverProfile.webAappointments.length == 0 ? null : driverProfile.webAappointments[0];
                    await checkForSlots(driverProfile.eligibleExams[0].code, driverProfile.eligibleExams[0].eed.date, existingAppointment);

                    [lat, lng] = nearestAddressesInfo.geometry.coordinates;
                    const locations = await getNearestPositions(lng, lat, driverProfile.eligibleExams[0].code, driverProfile.eligibleExams[0].eed.date)
                    console.log(locations)


                }
            }
            
        }
    }
    else {
        console.log(getCurrentURL())
        
        

        //window.location.href = HOME_URL
    }
    
    
    console.log()
}

async function checkForSlots(examType, eligibleDate, existingBooking) {
    //console.log(`Checking for ${examType}`)

    //const slots = await getLocationAppointments(2, eligibleDate, examType, LAST_NAME, LICENSE_ID)
    //console.log(slots)
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

// DOM section
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


// Requests section

async function getLocationAppointments(locationId, fromDate, type, lastName, licenseNumber) {
    const response = await fetch('https://onlinebusiness.icbc.com/deas-api/v1/web/getAvailableAppointments', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "Expires": "0",
            "pragma": "no-cache",
            "Cache-control": "no-cache, no-store",
            Authorization: localStorage.getItem("AUTH_TOKEN")
        },
        body: JSON.stringify({ 
            "aPosID": locationId,
            "examType": type,
            "examDate": fromDate,
            "ignoreReserveTime":false,
            "prfDaysOfWeek":"[0,1,2,3,4,5,6]",
            "prfPartsOfDay":"[0,1]",
            "lastName": lastName,
            "licenseNumber": licenseNumber
        })
    })
    return response.json();
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

async function getNearestPositions(lng, lat, examType, startDate) {
    const response = await fetch('https://onlinebusiness.icbc.com/deas-api/v1/web/getNearestPos', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "Expires": "0",
            "pragma": "no-cache",
            "Cache-control": "no-cache, no-store",
            Authorization: localStorage.getItem("AUTH_TOKEN")
        },
        body: JSON.stringify(
            { "lng": lng,
              "lat": lat,
              "examType": examType,
              "startDate": startDate
            }
        )
    })
    return response.json();
}

async function getNearestAddresses(cityName) {
    const cityNameEncoded = encodeURIComponent(cityName);
    const response = await fetch(`https://geocoder.api.gov.bc.ca/addresses.json?minScore=65&matchPrecision=occupant,unit,site,civic_number,block,locality&maxResults=5&echo=false&locationDescriptor=accessPoint&brief=true&autoComplete=true&addressString=${cityNameEncoded}`, {
        method: "GET",
        headers: {
            "Accept": "application/json, text/plain, */*",
            Authorization: localStorage.getItem("AUTH_TOKEN")
        }
    })
    return response.json();
}

const interval = setInterval(dispatch2, TIMER_INTERVAL)