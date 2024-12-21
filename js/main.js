// Получаем данные пользователя из localStorage
const userId = localStorage.getItem('userId');
const userLogin = localStorage.getItem('login');

document.getElementById('log2').innerHTML += userLogin;

function fetchTasks() {
    const serverURL = "http://localhost:8080/get_tasks?id_user=" + userId;

    fetch(serverURL)
        .then(res => {
            if (!res.ok) {
                return res.text().then(text => { throw new Error(text); });
            }
            return res.json();
        })
        .then(tasks => {
            const taskListInProc = document.getElementById("curr_task");
            const taskListCompl = document.getElementById("compl_task");
            taskListInProc.innerHTML = ""; // Очистить предыдущие задачи
            taskListCompl.innerHTML = ""; // Очистить предыдущие задачи

            tasks.forEach(task => {
                const li = document.createElement('li');
                let but = document.createElement('button')
                let carandash = document.createElement('img');
                carandash.style.maxWidth="100%";
                carandash.style.maxHeight="100%";
                carandash.setAttribute('src', './/..//images//carandash.jpg')
                carandash.style.objectFit="cover";
                if (task.task_status == "В процессе") {
                    taskListInProc.appendChild(li);
                    li.innerHTML = `Описание: ${task.task_description} **** Дата и время создания: ${task.time_creating}`;
                } else {
                    taskListCompl.appendChild(li);
                    li.innerHTML = `Описание: ${task.task_description} **** Дата и время завершения: ${task.time_creating}`;
                    li.setAttribute('data-id', task.id); // Сохраняем ID задачи в атрибуте
                    li.style.padding="10px";
                }
                
                li.setAttribute('data-id', task.id); // Сохраняем ID задачи в атрибуте
                li.style.padding="10px";
                but.setAttribute('data-id', task.id);
                but.style.width="2.3vw";
                but.style.height="4.6vh";
                but.style.position="absolute";
                but.style.right="28vw";
                but.style.borderRadius="30px";
                li.appendChild(but)
                but.appendChild(carandash)
                but.addEventListener('click', function(event) {
                    const serverURL_ut = "http://localhost:8080/update_task?id=" + task.id;
                    var div_ct = document.createElement('div');
                    var msg = document.createElement('p');
                    var inpDescr = document.createElement('textarea');
                    var btn_ct = document.createElement('button');
                
                    var parrent = document.getElementById('cont');
                    parrent.appendChild(div_ct);
                    div_ct.appendChild(msg);
                    div_ct.appendChild(inpDescr);
                    div_ct.appendChild(btn_ct);
                
                    div_ct.style.width = "47vw";
                    div_ct.style.position = 'absolute';
                    div_ct.style.zIndex = 4;
                    div_ct.style.height = "60vh";
                    div_ct.style.marginLeft = "25vw";
                    div_ct.style.marginTop = "7vh";
                
                    msg.innerHTML = "Enter Description: ";
                
                    inpDescr.setAttribute('id', "input_descr");
                    inpDescr.style.width = "40vw";
                    inpDescr.style.marginLeft = "3vw";
                    inpDescr.style.height = "20vh";
                    inpDescr.style.paddingTop = "0";
                    inpDescr.innerHTML=task.task_description;
                    inpDescr.style.lineHeight = "normal";
                
                    btn_ct.style.width = "10vw";
                    btn_ct.style.height = "6vh";
                    btn_ct.innerHTML = "Изменить";
                    btn_ct.style.marginLeft = "33vw";
                    btn_ct.addEventListener('click', function() {
                        let description = document.getElementById("input_descr").value;
                        parrent.removeChild(div_ct);
                        let data = {
                            'id_task': parseInt(task.id, 10),
                            'task_description1': description, // Исправлено имя поля
                        };
                        
                        fetch(serverURL_ut, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data) // Убедитесь, что вы правильно сериализуете данные
                        })
                        .then(res => {
                            if (!res.ok) {
                                return res.text().then(text => { throw new Error(text); });
                            }
                            return res.json();
                        })
                        .then(data => {
                            fetchTasks();
                        })
                        .catch(error => {
                            console.log(error.message);
                        });        
                    });
                });

                li.addEventListener('click', function() {
                    // Удаляем выделение у всех элементов
                    const allItems = taskListInProc.getElementsByTagName('li');
                    for (let item of allItems) {
                        item.classList.remove('selected');
                    }
                    // Выделяем текущий элемент
                    this.classList.add('selected');
                    // Сохраняем ID для удаления
                    selectedTaskId = task.id; // Переменная для хранения ID выбранной задачи
                });
            });
        })
        .catch(error => {
            console.log(error.message);
        });
}
fetchTasks();


function entDescrTask(callback) {
    var div_ct = document.createElement('div');
    var msg = document.createElement('p');
    var inpDescr = document.createElement('textarea');
    var btn_ct = document.createElement('button');

    var parrent = document.getElementById('cont');
    parrent.appendChild(div_ct);
    div_ct.appendChild(msg);
    div_ct.appendChild(inpDescr);
    div_ct.appendChild(btn_ct);

    div_ct.style.width = "47vw";
    div_ct.style.position = 'absolute';
    div_ct.style.zIndex = 4;
    div_ct.style.height = "60vh";
    div_ct.style.marginLeft = "25vw";
    div_ct.style.marginTop = "7vh";

    msg.innerHTML = "Enter Description: ";

    inpDescr.setAttribute('id', "input_descr");
    inpDescr.style.width = "40vw";
    inpDescr.style.marginLeft = "3vw";
    inpDescr.style.height = "20vh";
    inpDescr.style.paddingTop = "0";
    inpDescr.style.lineHeight = "normal";

    btn_ct.style.width = "10vw";
    btn_ct.style.height = "6vh";
    btn_ct.innerHTML = "Создать";
    btn_ct.style.marginLeft = "33vw";
    btn_ct.addEventListener('click', function() {
        let description = document.getElementById("input_descr").value;
        parrent.removeChild(div_ct);
        callback(description);
    });
}

function createTask() {
    entDescrTask(function(description) {
        const serverURL_ct = "http://localhost:8080/create_task"
        let data = {
            'id_user': parseInt(userId, 10),
            'task_status': 'В процессе',
            'task_description': description,
        };
        
        fetch(serverURL_ct, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data) // Убедитесь, что вы правильно сериализуете данные
        })
        .then(res => {
            if (!res.ok) {
                return res.text().then(text => { throw new Error(text); });
            }
            return res.json();
        })
        .then(data => {
            fetchTasks();
        })
        .catch(error => {
            console.log(error.message);
        });        
    });
}

document.getElementById('delTask').addEventListener('click', function() {
    if (selectedTaskId) {
        const serverURL = "http://localhost:8080/delete_task?id=" + selectedTaskId;

        fetch(serverURL, {
            method: 'DELETE',
        })
        .then(res => {
            if (!res.ok) {
                return res.text().then(text => { throw new Error(text); });
            }
            // Обновляем список задач после удаления
            fetchTasks();
        })
        .catch(error => {
            console.log(error.message);
        });
    }
});

let comTask = document.getElementById("complTask");

comTask.addEventListener('click', function() {
    var element = document.getElementsByClassName("selected")[0];
    var selectedTaskId = element.getAttribute("data-id");
    const serverURL_coTask = "http://localhost:8080/complTask?id=" + selectedTaskId;
    let data = {
        'id_task': parseInt(selectedTaskId, 10),
    };
   
    fetch(serverURL_coTask, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data) // Убедитесь, что вы правильно сериализуете данные
    })
    .then(res => {
        if (!res.ok) {
            return res.text().then(text => { throw new Error(text); });
        }
        return res.json();
    })
    .then(data => {
        fetchTasks();
    })
    .catch(error => {
        console.log(error.message);
    });

    li_to_clone = element.cloneNode(true);
    let ol_curr_task = document.getElementById("curr_task")
    ol_curr_task.removeChild(element);
});