package main

import (
	"dbdoes"
)

func main() {
	dbdoes.ConnectToDB() // Подключение к базе данных
	dbdoes.AuthRegUser() // Запуск сервера и авторизация/регистрация
}
