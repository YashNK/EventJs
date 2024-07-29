function contentLoad() {
    let tasks = JSON.parse(localStorage.getItem('task')) || [];
    let events = JSON.parse(localStorage.getItem('event')) || [];

    let eventMap = new Map();
    events.forEach(event => {
        eventMap.set(event.eventId, event.eventName);
    });

    let taskEvents = tasks.map(task => {
        return eventMap.get(task.eventId) || 'No Such Event';
    });

    let tasksTableBody = document.getElementById('tasksTableBody');
    tasks.forEach((task,index) => {
            const taskRow = document.createElement('tr');
            taskRow.innerHTML = `
            <td>${task.eventId}</td>
            <td>${taskEvents[index]}</td>
            <td>${task.taskName}</td>
            <td>${task.status}</td>
            `;
            tasksTableBody.appendChild(taskRow);
    });
}

function navigate(link){
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