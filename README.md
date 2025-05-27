# Tasks Manager

Tasks Manager — это система управления проектами и задачами с поддержкой многопользовательской работы. Пользователь может создавать проекты, добавлять в них других пользователей, инициировать задачи и назначать исполнителей. Основной стек: TypeScript, Express.js, PostgreSQL, Prisma ORM, Docker, Jest.

---

## Возможности системы

1. Регистрация и аутентификация

- Регистрация нового пользователя
- Авторизация с выдачей access и refresh токенов
- Обновление access токена
- Выход пользователя (аннулирование refresh-токена)

2. Управление проектами

- Создание проекта
- Удаление проекта
- Добавление участников в проект
- Удаление участников из проекта
- Просмотр проектов, в которых участвует пользователь

3. Управление задачами

- Создание задачи в рамках проекта(может любой участник проекта)
- Удаление задачи
- Назначение исполнителя (инициатор задачи назначает исполнителем себя или другого участника проекта)
- Изменение статуса задачи (CREATED(по-умолчанию), IN_PROGRESS, DONE)
- Просмотр задач по проектам и исполнителям

4. Аналитика времени

- Просмотр времени, затраченного всеми участниками на проект с фильтрацией по периоду
- Просмотр времени, затраченного конкретным пользователем, с фильтрацией по проектам и дате

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
npm run dc:cmp:devb
```

- **в prod режиме**

```bash
npm run dc:cmp:prodb
```

6. Создайте и примените миграцию базы данных(начальная миграция в проекте имеется, она будет применена автоматически):

```bash
npm run dc:prisma:migrate -- --name {migration_name}
```

7. Остановка и удаление контейнера:

```bash
npm run dc:cmp:down
```

### Команды

1. Запуск всех тестов:

```bash
npm run test
```

2. Запуск тестов по файлам:

```bash
npm run test -- --testPathPattern=src/middlewares/tests/auth.test.ts
npm run test -- --testPathPattern=src/controllers/tests/user.controller.test.ts
npm run test -- --testPathPattern=src/services/tests/user.service.test.ts
npm run test -- --testPathPattern=src/controllers/tests/project.controller.test.ts
npm run test -- --testPathPattern=src/services/tests/project.service.test.ts
npm run test -- --testPathPattern=src/controllers/tests/task.controller.test.ts
npm run test -- --testPathPattern=src/services/tests/task.service.test.ts
```

## Тестирование API

В папке проекта находится файл test.rest для расширения Rest Client в VSCode:
[Rest Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

Или используйте готовую коллекцию в Postman:
[Postman коллекция](https://www.postman.com/vitalalex/vital-alex/collection/tnenzn9/tasks-manager-api?action=share&creator=9639295)
