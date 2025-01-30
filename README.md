# Простой телеграм бот, показывающий курсы валют

Бот написан с использованием long polling без http сервера. Для получения обновлений с помощью вэбхуков, необходимо добавить http сервер в app.ts и endpoint для использования setWebhook.
Для получения курсов валют используется бесплатная версия [exchangeratesapi](https://exchangeratesapi.io/).

---

## Функциональность

- **/start**: Выводит приветствие.
- **/currency**: Выводит формат ввода валютной пары (USD-EUR) и список поддерживаемых валют.
- **/help**: Выводит список доступных команд.

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
