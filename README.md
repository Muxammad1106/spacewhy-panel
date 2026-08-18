# Spacewhy UI Kit

Чистый standalone-шаблон Spacewhy для запуска новых web-проектов. В папке
`frontend/` находится полный Next.js UI kit: все routes, dashboard templates,
component catalog, светлая и тёмная темы, Liquid Glass, локальные demo data и
документация для coding-агентов.

## Использование как основы нового проекта

```sh
git clone git@github.com:Muxammad1106/ui-kit-spacewhy.git
cd ui-kit-spacewhy
rm -rf .git
cd frontend
npm install
npm run dev
```

После удаления корневой `.git` создайте новую историю проекта:

```sh
git init
git add .
git commit -m "chore: initialize project from Spacewhy UI Kit"
```

## Структура

```text
ui-kit-spacewhy/
├── AGENTS.md
├── README.md
└── frontend/
    ├── docs/
    ├── public/
    ├── src/
    ├── tests/
    ├── package.json
    └── ...
```

Перед изменением UI прочитайте
[frontend/docs/README.md](frontend/docs/README.md). В документации описаны
архитектура, выбор компонентов, glass/theme contracts, routes, data boundaries,
accessibility и обязательные проверки.

## Проверка шаблона

```sh
cd frontend
npm test
npm run lint -- --no-cache
npx tsc --noEmit --incremental false
npm run build
```

Шаблон не содержит `.env`, build output, `node_modules` или истории исходного
репозитория. Legal provenance сохранён в `frontend/LICENSE.md`.
