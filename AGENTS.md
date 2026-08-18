# Spacewhy UI Kit agent contract

- Работайте внутри `frontend/` и начните с `frontend/docs/README.md`.
- Сохраняйте существующие routes, component anatomy, variants, states и UX.
- Используйте MUI/theme overrides и Spacewhy glass tokens вместо локального
  дублирования стилей.
- Route entry остаётся тонким; page composition размещается в `src/sections`.
- Используйте `src/routes/paths.ts`, shared component barrels и semantic theme
  roles.
- Не добавляйте старое Minimals branding, remote legacy assets, secrets или
  `.env` в Git.
- Перед handoff выполните tests, ESLint, TypeScript, production build и
  `git diff --check`.
