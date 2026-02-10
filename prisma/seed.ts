// Загружаем .env до инициализации Prisma Client (импорты поднимаются, поэтому через require)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEPARTMENTS_JSON_PATH = path.join(__dirname, '..', 'src', 'shared', 'database', 'departments.json');
const ROLE_NAME = 'Маркетинговый аналитик';
const PROMPT_NAME = 'Пример промпта для отчёта';

async function main() {
  // Отделы из departments.json (идемпотентно по name)
  const departmentsJson = JSON.parse(
    fs.readFileSync(DEPARTMENTS_JSON_PATH, 'utf-8'),
  );
  for (const d of departmentsJson) {
    await prisma.department.upsert({
      where: { name: d.name },
      create: {
        name: d.name,
        description: d.description ?? null,
        icon: d.icon ?? null,
      },
      update: {
        description: d.description ?? null,
        icon: d.icon ?? null,
      },
    });
  }

  const department = await prisma.department.findUnique({
    where: { name: 'Маркетинг' },
  });
  if (!department) {
    throw new Error('Отдел "Маркетинг" не найден после загрузки departments.json');
  }

  const role = await prisma.role.upsert({
    where: {
      departmentId_name: {
        departmentId: department.id,
        name: ROLE_NAME,
      },
    },
    create: {
      departmentId: department.id,
      name: ROLE_NAME,
      description: 'Аналитик маркетинговых данных',
      icon: 'user',
    },
    update: {},
  });

  const existingPrompt = await prisma.prompt.findFirst({
    where: { departmentId: department.id, roleId: role.id, name: PROMPT_NAME },
  });

  if (!existingPrompt) {
    await prisma.prompt.create({
      data: {
        name: PROMPT_NAME,
        icon: 'file-text',
        prompt: 'Ты — маркетинговый аналитик. Сформируй структурированный отчёт по данным, следуя правилам и критериям.',
        task: 'Подготовить еженедельный отчёт',
        task_description: 'Отчёт должен содержать ключевые метрики, тренды и рекомендации по улучшению.',
        departmentId: department.id,
        roleId: role.id,
        rules: [
          { key: 'rule_1', text: 'Проверяй источник данных' },
          { key: 'rule_2', text: 'Цитируй метрики с указанием периода' },
        ],
        key_references: [
          {
            title: 'Marketing Analytics Guide',
            author: 'Иванов И.',
            year: '2024',
            keyinsights: ['Фокус на конверсии', 'Сегментация по каналам'],
          },
        ],
        criteria: [
          {
            key: 'criteria_1',
            name: 'Полнота ответа',
            description: 'Ответ покрывает все пункты задания',
          },
        ],
        evaluationRubric: {
          '1': 'Неудовлетворительно',
          '5': 'Удовлетворительно',
          '10': 'Отлично',
        },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
