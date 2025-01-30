# Tasks Manager

Tasks Manager написан с использованием TypeScript, Express.js, Prisma ORM, Docker, Docker Compose.
Для тестирования эндпоинтов в папке проекта есть test.rest файл, для расширения VsCode [Rest Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).
Или [Postman коллекция](https://www.postman.com/vitalalex/vital-alex/collection/tnenzn9/tasks-manager-api?action=share&creator=9639295)

---

## Функциональность

- Регистрация/вход пользователя.
- Добавление/удаление проекта.
- Добавление/удаление пользователя в проект.
- Добавление/удаление задачи в проект.
- Назначение задачи исполнителю.
- Изменение статуса задачи.
- Просмотр своих проектов и связанных с ними задач.
- Просмотр времени, затраченного на проект всеми разработчиками с фильтрацией по периоду времени.
- Просмотр времени работы конкретного разработчика с фильтрацией по проектам и периоду времени.

---

## Установка и запуск

### Требования

- **Docker** версии 26.1.1 или выше.

### Установка

1. Клонируйте репозиторий:

```bash
git clone https://github.com/JbanTeam/tasks-manager.git
```

2. Перейдите в папку проекта:

```bash
cd tasks-manager
```

3. Установите зависимости:

```bash
npm install
```

4. Сгенерируйте prisma client:

```bash
npm run prisma:gen
```

5. Запустите сервер в docker контейнере:

- **в dev режиме**

```bash
npm run dc:cmp:dev
```

- **в prod режиме**

```bash
npm run dc:cmp:prod
```

6. Сделайте первую миграцию базы данных:

```bash
npm run dc:prisma:migrate -- --name init
```

### Команды

1. Запуск всех тестов:

```bash
npm run test
```

1. Запуск тестов по файлам:

```bash
npm run test -- src/controllers/tests/userController.test.ts
```

```bash
npm run test -- src/controllers/tests/projectController.test.ts
```

```bash
npm run test -- src/controllers/tests/taskController.test.ts
```

```bash
npm run test -- src/middlewares/tests/auth.test.ts
```
