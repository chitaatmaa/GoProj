package dbdoes

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

var db *sql.DB

// Функция для подключения к базе данных
func ConnectToDB() {
	connStr := "user=postgres password=0451 dbname=users host=localhost port=5432 sslmode=disable"

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Успешно подключено к базе данных!")
}

type User struct {
	Login    string `json:"login"`
	Password string `json:"passwd"`
}

type Task struct {
	UserID          uint16 `json:"id_user"`
	TaskStatus      string `json:"task_status"`
	TaskDescription string `json:"task_description"`
}

// Обработчик для регистрации пользователя
func registerHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	var user User

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err = db.Exec("INSERT INTO auth_data (login, password) VALUES ($1, $2)", user.Login, user.Password)
	if err != nil {

		http.Error(w, "Логин уже занят", http.StatusConflict)
		return
	}

	// Юзер зарегистрирован
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": fmt.Sprintf("Пользователь %s зарегистрирован", user.Login)})
}

// Обработчик для авторизации пользователя
func authHandler(w http.ResponseWriter, r *http.Request) {
	// Установка заголовков CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	var user User

	// Декодирование JSON из тела запроса
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Аутентификация
	var userID int
	err = db.QueryRow("SELECT id_user FROM auth_data WHERE login = $1 AND password = $2", user.Login, user.Password).Scan(&userID)
	if err != nil {
		http.Error(w, "Пользователя не существует", http.StatusInternalServerError)
		return
	}

	if userID == 0 {
		http.Error(w, "Неверный логин или пароль", http.StatusUnauthorized)
		return
	}

	// Возврат ID + логин пользователя (для дальнейшего использования)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "",
		"userId":  userID,
		"login":   user.Login,
	})
}

func ctHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	var task Task

	err := json.NewDecoder(r.Body).Decode(&task)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err = db.Exec("INSERT INTO task_creating (id_user, task_status, task_description, time_creating) VALUES ($1, $2, $3, $4)", task.UserID, task.TaskStatus, task.TaskDescription, time.Now())
	if err != nil {
		http.Error(w, err.Error(), http.StatusConflict)
		return
	}

	// Таск создан
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Задача создана",
	})
}

func getTasksHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	userID := r.URL.Query().Get("id_user") // Получаем id_user из параметров запроса

	rows, err := db.Query("SELECT id_task, task_status, task_description, time_creating FROM task_creating WHERE id_user = $1", userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	tasks := []map[string]interface{}{}
	for rows.Next() {
		var id int
		var taskStatus, taskDescription string
		var timeCreating time.Time

		if err := rows.Scan(&id, &taskStatus, &taskDescription, &timeCreating); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		tasks = append(tasks, map[string]interface{}{
			"id":               id,
			"task_status":      taskStatus,
			"task_description": taskDescription,
			"time_creating":    timeCreating,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

func deleteTaskHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	id := r.URL.Query().Get("id")

	_, err := db.Exec("DELETE FROM task_creating WHERE id_task = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent) // Успешное удаление
}

// Функция для запуска сервера
func AuthRegUser() {
	r := mux.NewRouter()
	r.HandleFunc("/register", registerHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/auth", authHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/create_task", ctHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/get_tasks", getTasksHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/delete_task", deleteTaskHandler).Methods("DELETE", "OPTIONS")

	log.Println("Сервер запущен на порту 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
