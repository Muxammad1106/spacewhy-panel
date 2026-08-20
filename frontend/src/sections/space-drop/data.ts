export type SpaceDropStatus = 'available' | 'soon' | 'planned';

export type SpaceDropItem = {
  id: string;
  name: string;
  summary: string;
  description: string;
  release: string;
  status: SpaceDropStatus;
  icon: string;
  href?: string;
};

export const SPACE_DROPS: SpaceDropItem[] = [
  {
    id: 'z01',
    name: 'Бронирование',
    summary: 'Запись и бронирование для любого бизнеса.',
    description:
      'Единое пространство для расписания, услуг, клиентов и напоминаний. Подойдёт салону, врачу, преподавателю, студии или любой команде, которая работает по записи.',
    release: 'Скоро',
    status: 'soon',
    icon: 'solar:calendar-mark-bold-duotone',
  },
  {
    id: 'z02',
    name: 'Финансы',
    summary: 'Доходы, расходы и баланс без сложной бухгалтерии.',
    description:
      'Ведите счета, категории, доходы и расходы. Смотрите актуальный баланс и историю операций в отдельном SpaceDrop Finance.',
    release: 'MVP',
    status: 'available',
    icon: 'solar:wallet-money-bold-duotone',
    href: process.env.NEXT_PUBLIC_FINANCE_URL || 'https://finance.spacewhy.uz',
  },
  {
    id: 'z03',
    name: 'AI-помощник',
    summary: 'Умные напоминания, которые понимают контекст.',
    description:
      'Напишите обычной фразой, что нужно не забыть. Инструмент выделит дату, людей и действие, а затем напомнит в подходящий момент.',
    release: 'Скоро',
    status: 'planned',
    icon: 'solar:bell-bing-bold-duotone',
  },
  {
    id: 'z04',
    name: 'Заметки',
    summary: 'Быстрый карман для ссылок, идей и файлов.',
    description:
      'Сохраняйте всё важное в один клик и находите позже по смыслу, а не по названию файла или папки.',
    release: 'Скоро',
    status: 'planned',
    icon: 'solar:inbox-archive-bold-duotone',
  },
  {
    id: 'z05',
    name: 'Расходы',
    summary: 'Разделяйте общие расходы без ручных расчётов.',
    description:
      'Создайте группу, добавьте покупки и сразу увидите самый простой способ рассчитаться друг с другом.',
    release: 'Скоро',
    status: 'planned',
    icon: 'solar:pie-chart-3-bold-duotone',
  },
  {
    id: 'z06',
    name: 'Команда',
    summary: 'Короткие поручения без перегруженного таск-трекера.',
    description:
      'Передавайте маленькие задачи, фиксируйте результат и не превращайте повседневные дела в большой проект.',
    release: 'Скоро',
    status: 'planned',
    icon: 'solar:plain-2-bold-duotone',
  },
];

export const FIRST_DROP = SPACE_DROPS[0];
