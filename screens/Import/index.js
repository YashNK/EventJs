let popupQueue = [];
let isPopupActive = false;
let isEventCsvMissingPopupShown = false;
let eventParsed = false;

function contentLoad(){
    let events = JSON.parse(localStorage.getItem('event'));
    let tasks = JSON.parse(localStorage.getItem('task'));

    if(events || tasks){
        navigate('../events/event-list.html')
    }
}
    
document.getElementById('fileReader').addEventListener('change', function() {
    let importLabel = document.getElementById('import-btn-label');
    const fileInput = document.getElementById('fileReader');
    
    if (fileInput.files[0]) {
        importLabel.classList.remove("import-btn-label");
        importLabel.classList.add("import-btn-label-selected");
        importLabel.innerHTML = fileInput.files[0].name + " File Imported";
    } else {
        importLabel.classList.remove("import-btn-label-selected");
        importLabel.classList.add("import-btn-label");
        importLabel.innerHTML = "Import CSV";
    }
});

document.getElementById('csvSelector').addEventListener('change', function(){
    let importLabel = document.getElementById('import-btn-label');
    const fileInput = document.getElementById('fileReader');

    if (fileInput.files[0]) {
        fileInput.value = "";
        importLabel.classList.remove("import-btn-label-selected");
        importLabel.classList.add("import-btn-label");
        importLabel.innerHTML = "Import CSV";
    }
})

document.getElementById('importBtn').addEventListener('click', function() {
    const fileInput = document.getElementById('fileReader');
    let csvSelector = document.getElementById('csvSelector').value;

    if (!fileInput.files.length) {
        enqueuePopup('Event Manager Pro.com:', 'Please select a file to upload');
        return;
    }

    const currentFile = fileInput.files[0];

    const csvFileReader = new FileReader();

    csvFileReader.onload = function(event) {
        const csvData = event.target.result;
        const parsedData = parseCSV(csvData, csvSelector);

        if (parsedData && !isEventCsvMissingPopupShown || parsedData && eventParsed) {
            saveToLocalStorage(csvSelector, parsedData);
        }
        let importLabel = document.getElementById('import-btn-label');
        importLabel.innerHTML = "Import CSV";
        importLabel.className = "import-btn-label";
    };
    csvFileReader.readAsText(currentFile);
    fileInput.value = ""
});

function parseCSV(csvData, csvSelector) {
    const csvRows = csvData.split('\n').map(row => row.trim()).filter(row => row.length > 0);
    const csvHeaders = csvRows[0].trim().split(',');

    const validHeaders = validateHeaders(csvHeaders, csvSelector);

    if (!validHeaders) {
        return;
    }

    const currentDate = new Date();
    const eventIds = [];
    let missingValues = false;

    const fileData = csvRows.slice(1).map(row => {
        const csvValues = row.trim().split(',');
        let obj = {};
        csvValues.forEach((cell, index) => {
            obj[csvHeaders[index]] = cell.trim();
        });

        const requiredFields = {
            'event': ['eventName', 'eventId', 'startDate', 'endDate'],
            'task': ['eventId', 'taskName']
        };

        const missingFields = requiredFields[csvSelector].filter(field => !obj[field] || obj[field] === 'null');
        if (missingFields.length > 0) {
            missingValues = true;
            enqueuePopup('Invalid Data', `Missing or null values for fields: ${missingFields.join(', ')}`);
            return false;
        }

        if (csvSelector === 'event') {
            if (eventIds.includes(obj.eventId)) {
                enqueuePopup('Invalid ID', 'Duplicate event ID found in Event CSV.');
                return false;
            }
            eventIds.push(obj.eventId);

            const startDate = new Date(obj.startDate.split('-').reverse().join('-'));
            startDate.setHours(0,0,0,0)
            const endDate = new Date(obj.endDate.split('-').reverse().join('-'));
            endDate.setHours(23,59,59,59)

            if (startDate > endDate) {
                enqueuePopup('Invalid Dates.', 'Start date must be before the end date.');
                return false;
            }
            
            if ((startDate <= currentDate) && (endDate >= currentDate)) {
                obj.status = "In Progress";
            } else if (startDate > currentDate) {
                obj.status = "Pending";
            } else {
                obj.status = "Event Failed";
            }
            eventParsed = true
        } else if (csvSelector === 'task') {
            let events = JSON.parse(localStorage.getItem('event'));
            if (!events) {
                if (!isEventCsvMissingPopupShown) {
                    enqueuePopup('Events.csv Missing.', 'Please upload the Event CSV file first.');
                    isEventCsvMissingPopupShown = true;
                }
                return false;
            }
            let eventId = obj.eventId;
            events.forEach(event => {
                if(event.eventId == eventId && event.status === 'Event Failed'){
                    obj.status = "Task Failed"
                } else if(event.eventId == eventId){
                    obj.status = "Pending";        
                }
            })
            eventParsed = true
        }
        return obj;
    }).filter(row => row !== null);;

    if (csvSelector === 'event' && checkDateOverlaps(fileData)) {
        enqueuePopup('Invalid Date', 'Date ranges overlap in the Event CSV.');
        return;
    }

    if (missingValues) {
        return null;
    }
    return fileData;
}

function validateHeaders(headers, csvSelector) {
    const expectedHeaders = {
        'event': ['eventName', 'eventId', 'startDate', 'endDate'],
        'task': ['eventId', 'taskName']
    };

    const requiredHeaders = expectedHeaders[csvSelector];

    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

    if (missingHeaders.length == 1) {
        enqueuePopup("Invalid headers.", `Missing: ${missingHeaders[0]} or Invalid File Type`);
        return false;
    }

    if (missingHeaders.length > 1) {
        enqueuePopup("Invalid File.", `Wrong File Input or Missing Headers`);
        return false;
    }

    return true;
}

function checkDateOverlaps(events) {
    const dateRanges = events.map(event => ({
        start: new Date(event.startDate.split('-').reverse().join('-')),
        end: new Date(event.endDate.split('-').reverse().join('-'))
    }));

    for (let i = 0; i < dateRanges.length; i++) {
        for (let j = i + 1; j < dateRanges.length; j++) {
            if (dateRanges[i].start <= dateRanges[j].end && dateRanges[i].end >= dateRanges[j].start) {
                return true;
            }
        }
    }
    return false;
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    enqueuePopup("Event Manager Pro.com.", "Data Imported Successfully!", true);
    checkIfBothCSVImported()
}

function checkIfBothCSVImported() {
    const eventCSV = localStorage.getItem('event');
    const taskCSV = localStorage.getItem('task');
    const viewEventListBtn = document.getElementById('viewEventListBtn');

    if (eventCSV && taskCSV) {
        viewEventListBtn.classList.remove('event-list-btn-disabled')
        viewEventListBtn.classList.add('event-list-btn')
        return
    } else {
        viewEventListBtn.classList.remove('event-list-btn')
        viewEventListBtn.classList.add('event-list-btn-disabled')
        return
    }
}

function enqueuePopup(title, message, isSuccess = false) {
    popupQueue.push({ title, message, isSuccess });
    if (!isPopupActive) {
        processPopupQueue();
    }
}

function processPopupQueue() {
    if (popupQueue.length === 0) {
        isPopupActive = false;
        return;
    }

    isPopupActive = true;
    const { title, message, isSuccess } = popupQueue.shift();

    if (isSuccess) {
        popupSuccess(title, message);
    } else {
        popup(title, message);
    }
}

function popup(title, message) {
    const popupContainer = document.getElementById('popupContainer');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');
    const popupCloseBtn = document.getElementById('popupCloseBtn');
    popupCloseBtn.src = "../../assets/close-red.png";

    function closePopUp() {
        popupContainer.classList.add('contract'); 
        setTimeout(() => {
            popupContainer.style.top = '-150px';
            popupContainer.classList.remove('expand', 'contract');
            popupCloseBtn.style.opacity = '0%';
            processPopupQueue();
        }, 500); 
    }

    popupTitle.textContent = title;
    popupMessage.textContent = message;

    popupContainer.classList.remove("popup-container-success");
    popupContainer.className = "popup-container";
    popupContainer.style.top = '10px';

    setTimeout(() => {
        popupContainer.classList.add('expand');
        popupCloseBtn.style.opacity = '100%';
    }, 450);
    popupCloseBtn.addEventListener('click', () => {
        popupCloseBtn.style.opacity = '0%';
        closePopUp();
    }, { once: true }); 
    setTimeout(() => {
        if (popupContainer.classList.contains('expand')) {
            popupCloseBtn.style.opacity = '0%';
            closePopUp();
        }
    }, 2000);
}

function popupSuccess(title, message) {
    const popupContainer = document.getElementById('popupContainer');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');
    const popupCloseBtn = document.getElementById('popupCloseBtn');
    popupCloseBtn.src = "../../assets/close-success.png";

    function closePopUp() {
        popupContainer.classList.add('contract'); 
        setTimeout(() => {
            popupContainer.style.top = '-150px';
            popupContainer.classList.remove('expand', 'contract');
            popupCloseBtn.style.opacity = '0%';
            processPopupQueue();
        }, 500); 
    }

    popupTitle.textContent = title;
    popupMessage.textContent = message;

    popupContainer.classList.remove("popup-container");
    popupContainer.className = "popup-container-success";
    popupContainer.style.top = '10px';

    setTimeout(() => {
        popupContainer.classList.add('expand');
        popupCloseBtn.style.opacity = '100%';
    }, 450);
    popupCloseBtn.addEventListener('click', () => {
        popupCloseBtn.style.opacity = '0%';
        closePopUp();
    }, { once: true }); 
    setTimeout(() => {
        if (popupContainer.classList.contains('expand')) {
            popupCloseBtn.style.opacity = '0%';
            closePopUp();
        }
    }, 2000);
}  

function navigate(link) {
    window.location.href = link;
}