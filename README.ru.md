<div align="center">
  <img src="public/logo.svg" alt="CloudCLI UI" width="64" height="64">
  <h1>Cloud CLI (aka Claude Code UI)</h1>
  <p>Десктопный и мобильный UI для <a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</a>, <a href="https://docs.cursor.com/en/cli/overview">Cursor CLI</a>, <a href="https://developers.openai.com/codex">Codex</a> и <a href="https://geminicli.com/">Gemini-CLI</a>.<br>Используйте локально или удалённо, чтобы просматривать активные проекты и сессии отовсюду.</p>
</div>

<p align="center">
  <a href="https://cloudcli.ai">CloudCLI Cloud</a> · <a href="https://cloudcli.ai/docs">Документация</a> · <a href="https://discord.gg/buxwujPNRE">Discord</a> · <a href="https://github.com/siteboon/claudecodeui/issues">Сообщить об ошибке</a> · <a href="CONTRIBUTING.md">Участие в разработке</a>
</p>

<p align="center">
  <a href="https://cloudcli.ai"><img src="https://img.shields.io/badge/☁️_CloudCLI_Cloud-Try_Now-0066FF?style=for-the-badge" alt="CloudCLI Cloud"></a>
  <a href="https://discord.gg/buxwujPNRE"><img src="https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Join our Discord"></a>
  <br><br>
  <a href="https://trendshift.io/repositories/15586" target="_blank"><img src="https://trendshift.io/api/badge/repositories/15586" alt="siteboon%2Fclaudecodeui | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
</p>

<div align="right"><i><a href="./README.md">English</a> · <b>Русский</b> · <a href="./README.de.md">Deutsch</a> · <a href="./README.ko.md">한국어</a> · <a href="./README.zh-CN.md">中文</a> · <a href="./README.ja.md">日本語</a></i></div>

---

## Скриншоты

<div align="center">

<table>
<tr>
<td align="center">
<h3>Версия для десктопа</h3>
<img src="public/screenshots/desktop-main.png" alt="Desktop Interface" width="400">
<br>
<em>Главный интерфейс в стиле Claude Code</em>
</td>
<td align="center">
<h3>Мобильная версия</h3>
<img src="public/screenshots/mobile-chat.png" alt="Mobile Interface" width="250">
<br>
<em>Адаптивный мобильный дизайн с сенсорной навигацией</em>
</td>
</tr>
<tr>
<td align="center" colspan="2">
<h3>Выбор CLI</h3>
<img src="public/screenshots/cli-selection.png" alt="CLI Selection" width="400">
<br>
<em>Выбирайте между Claude Code, Gemini, Cursor CLI и Codex</em>
</td>
</tr>
</table>

</div>

## Возможности

- **Адаптивный дизайн** - Безупречно работает на десктопе, планшете и мобильных устройствах, позволяя использовать Agents откуда угодно
- **Тема в стиле Claude Code** - Красивый дизайн с янтарными тонами, вдохновлённый эстетикой Claude Code CLI
- **Интерактивный чат-интерфейс** - Встроенный UI чата для удобного общения с Agents
- **Интегрированный терминал** - Прямой доступ к Agents CLI через встроенную оболочку
- **Проводник файлов** - Интерактивное дерево файлов с подсветкой синтаксиса и редактированием в реальном времени
- **Git-проводник** - Просматривайте, индексируйте и коммитьте изменения. Также можно переключать ветки
- **Гибкий выбор рабочей области** - Выбирайте рабочие области с любого диска или директории без ограничений
- **Управление сессиями** - Возобновляйте разговоры, управляйте несколькими сессиями и отслеживайте историю
- **Система плагинов** - Расширяйте CloudCLI с помощью пользовательских плагинов — добавляйте новые вкладки, бэкенд-сервисы и интеграции. [Создайте свой →](https://github.com/cloudcli-ai/cloudcli-plugin-starter)
- **Интеграция TaskMaster AI** *(Опционально)* - Продвинутое управление проектами с AI-планированием задач, парсингом PRD и автоматизацией рабочих процессов
- **Совместимость с моделями** - Работает с семействами моделей Claude, GPT и Gemini (полный список поддерживаемых моделей см. в [`shared/modelConstants.js`](shared/modelConstants.js))

## Быстрый старт

### CloudCLI Cloud (Рекомендуется)

Самый быстрый способ начать — без локальной настройки. Получите полностью управляемую контейнеризированную среду разработки, доступную через веб, мобильное приложение, API или любимую IDE.

**[Начать с CloudCLI Cloud](https://cloudcli.ai)**

### Самостоятельный хостинг (Open source)

Запустите CloudCLI UI мгновенно с помощью **npx** (требуется Node.js v22+):

```
npx @siteboon/claude-code-ui
```

Или установите **глобально** для регулярного использования:

```
npm install -g @siteboon/claude-code-ui
cloudcli
```

Откройте `http://localhost:3001` — все существующие сессии будут обнаружены автоматически.

Посетите **[документацию →](https://cloudcli.ai/docs)** для дополнительных параметров конфигурации, PM2, настройки удалённого сервера и многого другого

---

## Какой вариант подходит вам?

CloudCLI UI — это слой с открытым исходным кодом, на котором работает CloudCLI Cloud. Вы можете самостоятельно хостить его на своей машине или использовать CloudCLI Cloud с полностью управляемой облачной средой, функциями для команд и более глубокой интеграцией.

| | CloudCLI UI (Самостоятельный хостинг) | CloudCLI Cloud |
|---|---|---|
| **Подходит для** | Разработчиков, которым нужен полный UI для локальных сессий агентов на своей машине | Команд и разработчиков, которым нужны агенты, работающие в облаке, доступные откуда угодно |
| **Способ доступа** | Браузер через `[yourip]:port` | Браузер, любая IDE, REST API, n8n |
| **Настройка** | `npx @siteboon/claude-code-ui` | Настройка не требуется |
| **Машина должна быть включена** | Да | Нет |
| **Мобильный доступ** | Любой браузер в вашей сети | Любое устройство, нативное приложение в разработке |
| **Доступные сессии** | Все сессии автоматически обнаруживаются из `~/.claude` | Все сессии в вашей облачной среде |
| **Поддерживаемые Agents** | Claude Code, Cursor CLI, Codex, Gemini CLI | Claude Code, Cursor CLI, Codex, Gemini CLI |
| **Проводник файлов и Git** | Да, встроено в UI | Да, встроено в UI |
| **Конфигурация MCP** | Управляется через UI, синхронизируется с локальным конфигом `~/.claude` | Управляется через UI |
| **Доступ к IDE** | Ваша локальная IDE | Любая IDE, подключённая к облачной среде |
| **REST API** | Да | Да |
| **Узел n8n** | Нет | Да |
| **Совместное использование командой** | Нет | Да |
| **Стоимость платформы** | Бесплатно, open source | От $7/месяц |

> Оба варианта используют ваши собственные AI-подписки (Claude, Cursor и т.д.) — CloudCLI предоставляет среду, а не AI.

---

## Безопасность и настройка инструментов

**🔒 Важное уведомление**: Все инструменты Claude Code **отключены по умолчанию**. Это предотвращает автоматическое выполнение потенциально вредоносных операций.

### Включение инструментов

Чтобы использовать полную функциональность Claude Code, вам нужно вручную включить инструменты:

1. **Откройте настройки инструментов** - Нажмите на значок шестерёнки в боковой панели
2. **Включайте выборочно** - Включайте только необходимые инструменты
3. **Примените настройки** - Ваши предпочтения сохраняются локально

<div align="center">

![Модальное окно настроек инструментов](public/screenshots/tools-modal.png)
*Интерфейс настроек инструментов — включайте только то, что нужно*

</div>

**Рекомендуемый подход**: Начните с включения базовых инструментов и добавляйте другие по мере необходимости. Вы всегда можете изменить эти настройки позже.

---

## Плагины

В CloudCLI есть система плагинов, которая позволяет добавлять пользовательские вкладки с собственным фронтенд UI и опциональным Node.js бэкендом. Устанавливайте плагины из git-репозиториев прямо в **Settings > Plugins** или создавайте свои.

### Доступные плагины

| Плагин | Описание |
|---|---|
| **[Project Stats](https://github.com/cloudcli-ai/cloudcli-plugin-starter)** | Показывает количество файлов, строк кода, распределение по типам файлов, самые большие файлы и недавно изменённые файлы для текущего проекта |
| **[Web Terminal](https://github.com/cloudcli-ai/cloudcli-plugin-terminal)** | Полноценный терминал на xterm.js с поддержкой нескольких вкладок |

### Создайте свой

**[Шаблон стартера плагина →](https://github.com/cloudcli-ai/cloudcli-plugin-starter)** — форкните этот репозиторий, чтобы создать свой плагин. Включает пример с фронтенд-рендерингом, обновлениями контекста в реальном времени и RPC-взаимодействием с бэкенд-сервером.

**[Документация плагинов →](https://cloudcli.ai/docs/plugin-overview)** — полное руководство по API плагинов, формату манифеста, модели безопасности и многому другому.

---
## FAQ

<details>
<summary>Чем это отличается от Claude Code Remote Control?</summary>

Claude Code Remote Control позволяет отправлять сообщения в сессию, уже работающую в вашем локальном терминале. Ваша машина должна быть включена, терминал должен быть открыт, и сессии истекают примерно через 10 минут без сетевого соединения.

CloudCLI UI и CloudCLI Cloud расширяют Claude Code, а не сидят рядом с ним — ваши MCP-серверы, права доступа, настройки и сессии — это те же самые, которые Claude Code использует нативно. Ничего не дублируется и не управляется отдельно.

На практике это означает:

- **Все ваши сессии, а не только одна** — CloudCLI UI автоматически обнаруживает каждую сессию из вашей папки `~/.claude`. Remote Control предоставляет только одну активную сессию для мобильного приложения Claude.
- **Ваши настройки — это ваши настройки** — MCP-серверы, права инструментов и конфигурация проекта, которые вы меняете в CloudCLI UI, записываются напрямую в конфиг Claude Code и немедленно вступают в силу, и наоборот.
- **Работает с большим количеством агентов** — Claude Code, Cursor CLI, Codex и Gemini CLI, а не только Claude Code.
- **Полный UI, а не просто окно чата** — проводник файлов, интеграция Git, управление MCP и терминал — всё встроено.
- **CloudCLI Cloud работает в облаке** — закройте ноутбук, агент продолжит работать. Не нужно следить за терминалом и держать машину включённой.

</details>

<details>
<summary>Нужно ли мне отдельно платить за AI-подписку?</summary>

Да. CloudCLI предоставляет среду, а не AI. Вы используете свою подписку Claude, Cursor, Codex или Gemini. CloudCLI Cloud предоставляет хостинг-среду от $7/месяц сверх этого.

</details>

<details>
<summary>Могу ли я использовать CloudCLI UI на телефоне?</summary>

Да. Для самостоятельного хостинга запустите сервер на своей машине и откройте `[yourip]:port` в любом браузере вашей сети. Для CloudCLI Cloud откройте его с любого устройства — без VPN, без проброса портов, без настройки. Нативное приложение также в разработке.

</details>

<details>
<summary>Повлияют ли изменения, которые я вношу в UI, на мою локальную настройку Claude Code?</summary>

Да, для самостоятельного хостинга. CloudCLI UI читает и пишет в тот же конфиг `~/.claude`, который Claude Code использует нативно. MCP-серверы, добавленные через UI, немедленно появляются в Claude Code и наоборот.

</details>

---

## Сообщество и поддержка

- **[Документация](https://cloudcli.ai/docs)** — установка, конфигурация, функции и устранение неполадок
- **[Discord](https://discord.gg/buxwujPNRE)** — получите помощь и общайтесь с другими пользователями
- **[GitHub Issues](https://github.com/siteboon/claudecodeui/issues)** — сообщения об ошибках и запросы функций
- **[Руководство по участию](CONTRIBUTING.md)** — как внести вклад в проект

## Лицензия

GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later) — см. [LICENSE](LICENSE) для полного текста.

Этот проект является открытым исходным кодом и может свободно использоваться, модифицироваться и распространяться под лицензией AGPL-3.0-or-later. Если вы модифицируете это ПО и запускаете его как сетевой сервис, вы должны предоставить модифицированный исходный код пользователям этого сервиса.

## Благодарности

### Создано с использованием
- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** - Официальный CLI от Anthropic
- **[Cursor CLI](https://docs.cursor.com/en/cli/overview)** - Официальный CLI от Cursor
- **[Codex](https://developers.openai.com/codex)** - OpenAI Codex
- **[Gemini-CLI](https://geminicli.com/)** - Google Gemini CLI
- **[React](https://react.dev/)** - Библиотека пользовательского интерфейса
- **[Vite](https://vitejs.dev/)** - Быстрый инструмент сборки и сервер разработки
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS фреймворк
- **[CodeMirror](https://codemirror.net/)** - Продвинутый редактор кода
- **[TaskMaster AI](https://github.com/eyaltoledano/claude-task-master)** *(Опционально)* - AI-управление проектами и планирование задач


### Спонсоры
- [Siteboon - AI powered website builder](https://siteboon.ai)
---

<div align="center">
  <strong>Сделано с заботой для сообщества Claude Code, Cursor и Codex.</strong>
</div>
