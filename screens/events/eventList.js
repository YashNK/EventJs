function contentLoad() {
    let events = JSON.parse(localStorage.getItem('event')) || [];
    let eventsTableBody = document.getElementById('eventsTableBody');

    events.forEach((event, index) => {
        dateStatusUpdation(event);
        let actionBtn = document.createElement('button');
        actionBtn.textContent = "View Tasks";
        let tableRow = document.createElement('tr');
    
        tableRow.innerHTML = `
            <td class="row-container">${event.eventId}</td>
            <td class="row-container">${event.eventName}</td>
            <td class="row-container">${event.startDate}</td>
            <td class="row-container">${event.endDate}</td>
            <td class="row-container">${event.status}</td>
            <td class="button-container">
                <button class="action-btn" onclick='viewTasks(this, ${index})'>
                    ${actionBtn.textContent}
                </button>
            </td>
        `;
        eventsTableBody.appendChild(tableRow);
    });

    localStorage.setItem('event', JSON.stringify(events));
}

function dateStatusUpdation(event) {
    let currentDate = new Date();
    let startDate = new Date(event.startDate.split('-').reverse().join('-'));
    let endDate = new Date(event.endDate.split('-').reverse().join('-'));

    if (event.status === 'Event Completed') {
        event.status = 'Event Completed';
        return
    }

    if(event.status === 'Event Failed'){
        event.status = 'Event Failed'
        return
    }

    if (currentDate >= startDate && currentDate <= endDate && event.status !== 'Event Completed' && event.status !== 'Event Failed') {
        event.status = "In Progress";
    } else if (currentDate < startDate && event.status !== 'Event Completed') {
        event.status = "Pending";
    } else if (currentDate > endDate && event.status !== 'Event Completed') {
        event.status = "Event Failed";
    }
}

function viewTasks(button, index) {
    let events = JSON.parse(localStorage.getItem('event'));
    let currentEventArrayNumber = index;
    let inProgressEvent = -1;
    
    let currentDate = new Date();
    let startDate = new Date(events[index].startDate.split('-').reverse().join('-'));
    let endDate = new Date(events[index].endDate.split('-').reverse().join('-'));

    if (events[index].status === 'In Progress' && currentDate >= startDate && currentDate <= endDate) {
        inProgressEvent = index;
        localStorage.setItem('in-progress-event', inProgressEvent);
    } else if(currentDate >= startDate && currentDate <= endDate){
        inProgressEvent = index;
        localStorage.setItem('in-progress-event', inProgressEvent);
    }
    localStorage.setItem('current-event-array', currentEventArrayNumber);
    window.location.href = `../event-tasks/event-task-list.html`;
}

function navigate(link) {
    window.location.href = link;
}

function confirmReturn(){
    let confirmationPopUpContainer = document.getElementById('confirmationPopUpContainer')
    confirmationPopUpContainer.style.opacity = '100%';
    confirmationPopUpContainer.style.zIndex = '2';
}

function closeConfirmPopUp(){
    let confirmationPopUpContainer = document.getElementById('confirmationPopUpContainer')
    confirmationPopUpContainer.style.opacity = '0%';
    confirmationPopUpContainer.style.zIndex = '-1';
}

function navigateToImportScreen(){
    let events = JSON.parse(localStorage.getItem('event'));
    let tasks = JSON.parse(localStorage.getItem('task'));
    let currentEventArrayNumber = JSON.parse(localStorage.getItem('current-event-array'));
    let inProgressEvent = JSON.parse(localStorage.getItem('in-progress-event'))

    if(events || tasks || currentEventArrayNumber || inProgressEvent ){
        localStorage.removeItem('event')
        localStorage.removeItem('task')
        localStorage.removeItem('current-event-array')
        localStorage.removeItem('in-progress-event')
    }

    navigate("../import/index.html")
}