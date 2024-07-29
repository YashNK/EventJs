let temporaryTasks = JSON.parse(localStorage.getItem('task')) || [];
let temporaryEvents = JSON.parse(localStorage.getItem('event')) || [];

function contentLoad() {
    const tasks = JSON.parse(localStorage.getItem('task')) || [];
    const events = JSON.parse(localStorage.getItem('event')) || [];
    const currentEventArrayNumber = JSON.parse(localStorage.getItem('current-event-array'));
    const inProgressEvent = JSON.parse(localStorage.getItem('in-progress-event'));
    const tableBody = document.getElementById('tasksTableBody');
    
    const isAnyTaskInProgress = temporaryTasks.some(task => task.eventId === events[currentEventArrayNumber].eventId && task.status === 'In Progress');

    tableBody.innerHTML = '';

    tasks.forEach((task, index) => {
        if (task.eventId === events[currentEventArrayNumber].eventId) {
            const tableRow = document.createElement('tr');
            const pendingSelectDisabled = events[currentEventArrayNumber].status === 'Pending' ? 'disabled' : '';
            const completedSelectDisabled = events[currentEventArrayNumber].status === 'Event Completed' ? 'disabled' : '';
            let taskFailedSelectDisabled = '';
            if(currentEventArrayNumber != inProgressEvent){
                taskFailedSelectDisabled = events[currentEventArrayNumber].status === 'Event Failed' ? 'disabled' : '';
            }
            const disableInProgressOption = isAnyTaskInProgress && task.status !== 'In Progress' ? 'disabled' : '';

            tableRow.innerHTML = `
                <td>${events[currentEventArrayNumber].eventName}</td>
                <td>${task.taskName}</td>
                <td>
                    <select class="taskStatusSelect" onchange="updateStatus(this, ${index})">
                        <option value="Pending" ${taskFailedSelectDisabled} ${completedSelectDisabled} ${temporaryTasks[index].status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${pendingSelectDisabled} ${completedSelectDisabled} ${taskFailedSelectDisabled} ${temporaryTasks[index].status === 'In Progress' ? 'selected' : ''} ${disableInProgressOption}>In Progress</option>
                        <option value="Task Completed" ${completedSelectDisabled} ${pendingSelectDisabled} ${temporaryTasks[index].status === 'Task Completed' ? 'selected' : ''}>Task Completed</option>
                        <option value="Task Failed" ${taskFailedSelectDisabled} ${completedSelectDisabled} ${pendingSelectDisabled} ${temporaryTasks[index].status === 'Task Failed' ? 'selected' : ''}>Task Failed</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(tableRow);
        }
    });
}

function updateStatus(select, index) {
    let selectedStatus = select.value;
    temporaryTasks[index].status = selectedStatus;

    let currentEventArrayNumber = JSON.parse(localStorage.getItem('current-event-array'));
    const eventId = temporaryEvents[currentEventArrayNumber].eventId;

    if (areAllTasksCompleted(eventId)) {
        temporaryEvents[currentEventArrayNumber].status = 'Event Completed';
    } else if (isAnyTaskFailed(eventId)) {
        temporaryEvents[currentEventArrayNumber].status = 'Event Failed';
    } else {
        temporaryEvents[currentEventArrayNumber].status = 'In Progress';
    }
    contentLoad();
}

function areAllTasksCompleted(eventId) {
    return temporaryTasks.filter(task => task.eventId === eventId).every(task => task.status === 'Task Completed');
}

function isAnyTaskFailed(eventId) {
    return temporaryTasks.filter(task => task.eventId === eventId).some(task => task.status === 'Task Failed');
}

function navigate(link){
    window.location.href = link;
}

document.getElementById('formSaveBtn').addEventListener('click', function() {
    localStorage.setItem('task', JSON.stringify(temporaryTasks));
    localStorage.setItem('event', JSON.stringify(temporaryEvents));
    navigate('../events/event-list.html');
});

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