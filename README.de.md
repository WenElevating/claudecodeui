<div align="center">
  <img src="public/logo.svg" alt="CloudCLI UI" width="64" height="64">
  <h1>Cloud CLI (auch bekannt als Claude Code UI)</h1>
  <p>Eine Desktop- und Mobile-Oberfläche für <a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</a>, <a href="https://docs.cursor.com/en/cli/overview">Cursor CLI</a>, <a href="https://developers.openai.com/codex">Codex</a> und <a href="https://geminicli.com/">Gemini-CLI</a>.<br>Lokal oder remote nutzbar – verwalte deine aktiven Projekte und Sitzungen von überall.</p>
</div>

<p align="center">
  <a href="https://cloudcli.ai">CloudCLI Cloud</a> · <a href="https://cloudcli.ai/docs">Dokumentation</a> · <a href="https://discord.gg/buxwujPNRE">Discord</a> · <a href="https://github.com/siteboon/claudecodeui/issues">Fehler melden</a> · <a href="CONTRIBUTING.md">Mitwirken</a>
</p>

<p align="center">
  <a href="https://cloudcli.ai"><img src="https://img.shields.io/badge/☁️_CloudCLI_Cloud-Try_Now-0066FF?style=for-the-badge" alt="CloudCLI Cloud"></a>
  <a href="https://discord.gg/buxwujPNRE"><img src="https://img.shields.io/badge/Discord-Join_Community-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Join Community"></a>
  <br><br>
  <a href="https://trendshift.io/repositories/15586" target="_blank"><img src="https://trendshift.io/api/badge/repositories/15586" alt="siteboon%2Fclaudecodeui | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
</p>

<div align="right"><i><a href="./README.md">English</a> · <a href="./README.ru.md">Русский</a> · <b>Deutsch</b> · <a href="./README.ko.md">한국어</a> · <a href="./README.zh-CN.md">中文</a> · <a href="./README.ja.md">日本語</a></i></div>

---

## Screenshots

<div align="center">

<table>
<tr>
<td align="center">
<h3>Desktop-Ansicht</h3>
<img src="public/screenshots/desktop-main.png" alt="Desktop-Oberfläche" width="400">
<br>
<em>Hauptoberfläche im Claude Code Stil</em>
</td>
<td align="center">
<h3>Mobile-Erlebnis</h3>
<img src="public/screenshots/mobile-chat.png" alt="Mobile-Oberfläche" width="250">
<br>
<em>Responsives Mobile-Design mit Touch-Navigation</em>
</td>
</tr>
<tr>
<td align="center" colspan="2">
<h3>CLI-Auswahl</h3>
<img src="public/screenshots/cli-selection.png" alt="CLI-Auswahl" width="400">
<br>
<em>Wähle zwischen Claude Code, Gemini, Cursor CLI und Codex</em>
</td>
</tr>
</table>

</div>

## Funktionen

- **Responsives Design** - Funktioniert nahtlos auf Desktop, Tablet und Mobile, damit du Agents von überall nutzen kannst
- **Claude Code Stil Design** - Wunderschönes Design in Bernsteintönen, inspiriert von der Claude Code CLI-Ästhetik
- **Interaktive Chat-Oberfläche** - Eingebaute Chat-UI für nahtlose Kommunikation mit Agents
- **Integriertes Shell-Terminal** - Direkter Zugriff auf die Agents CLI über eingebaute Shell-Funktionalität
- **Datei-Explorer** - Interaktiver Dateibaum mit Syntax-Hervorhebung und Live-Bearbeitung
- **Git-Explorer** - Änderungen anzeigen, stagen und committen. Auch Branch-Wechsel möglich
- **Flexible Workspace-Auswahl** - Wähle Workspaces von jedem Laufwerk oder Verzeichnis ohne Einschränkungen
- **Sitzungsverwaltung** - Gespräche fortsetzen, mehrere Sitzungen verwalten und Verlauf verfolgen
- **Plugin-System** - Erweitere CloudCLI mit benutzerdefinierten Plugins — neue Tabs, Backend-Services und Integrationen hinzufügen. [Eigenes erstellen →](https://github.com/cloudcli-ai/cloudcli-plugin-starter)
- **TaskMaster AI Integration** *(Optional)* - Fortgeschrittenes Projektmanagement mit KI-gestützter Aufgabenplanung, PRD-Analyse und Workflow-Automatisierung
- **Modell-Kompatibilität** - Funktioniert mit Claude, GPT und Gemini Modellfamilien (siehe [`shared/modelConstants.js`](shared/modelConstants.js) für die vollständige Liste unterstützter Modelle)

## Schnellstart

### CloudCLI Cloud (Empfohlen)

Der schnellste Weg um zu starten — ohne lokale Einrichtung. Erhalte eine vollständig verwaltete, containerisierte Entwicklungsumgebung, zugänglich über Web, Mobile-App, API oder deine bevorzugte IDE.

**[Starte mit CloudCLI Cloud](https://cloudcli.ai)**

### Selbst hosten (Open Source)

Starte CloudCLI UI sofort mit **npx** (benötigt Node.js v22+):

```
npx @siteboon/claude-code-ui
```

Oder installiere **global** für regelmäßige Nutzung:

```
npm install -g @siteboon/claude-code-ui
cloudcli
```

Öffne `http://localhost:3001` — alle bestehenden Sitzungen werden automatisch erkannt.

Besuche die **[Dokumentation →](https://cloudcli.ai/docs)** für weitere Konfigurationsoptionen, PM2, Remote-Server-Setup und mehr

---

## Welche Option ist die richtige für dich?

CloudCLI UI ist die Open-Source-UI-Schicht, die CloudCLI Cloud antreibt. Du kannst es auf deiner eigenen Maschine selbst hosten oder CloudCLI Cloud nutzen, das eine vollständig verwaltete Cloud-Umgebung, Team-Funktionen und tiefere Integrationen bietet.

| | CloudCLI UI (Selbst gehostet) | CloudCLI Cloud |
|---|---|---|
| **Geeignet für** | Entwickler, die eine vollständige UI für lokale Agent-Sitzungen auf eigener Maschine wollen | Teams und Entwickler, die Agents in der Cloud laufen haben wollen, zugänglich von überall |
| **Zugriff** | Browser über `[yourip]:port` | Browser, jede IDE, REST API, n8n |
| **Einrichtung** | `npx @siteboon/claude-code-ui` | Keine Einrichtung nötig |
| **Maschine muss an bleiben** | Ja | Nein |
| **Mobile-Zugriff** | Jeder Browser in deinem Netzwerk | Jedes Gerät, native App in Entwicklung |
| **Verfügbare Sitzungen** | Alle Sitzungen automatisch erkannt aus `~/.claude` | Alle Sitzungen in deiner Cloud-Umgebung |
| **Unterstützte Agents** | Claude Code, Cursor CLI, Codex, Gemini CLI | Claude Code, Cursor CLI, Codex, Gemini CLI |
| **Datei-Explorer und Git** | Ja, in UI integriert | Ja, in UI integriert |
| **MCP-Konfiguration** | Über UI verwaltet, synchronisiert mit lokalem `~/.claude` Config | Über UI verwaltet |
| **IDE-Zugriff** | Deine lokale IDE | Jede IDE, verbunden mit deiner Cloud-Umgebung |
| **REST API** | Ja | Ja |
| **n8n Node** | Nein | Ja |
| **Team-Sharing** | Nein | Ja |
| **Plattformkosten** | Kostenlos, Open Source | Ab $7/Monat |

> Beide Optionen nutzen deine eigenen KI-Abos (Claude, Cursor, etc.) — CloudCLI stellt die Umgebung bereit, nicht die KI.

---

## Sicherheit & Tools-Konfiguration

**🔒 Wichtiger Hinweis**: Alle Claude Code Tools sind **standardmäßig deaktiviert**. Dies verhindert, dass potenziell schädliche Operationen automatisch ausgeführt werden.

### Tools aktivieren

Um die volle Funktionalität von Claude Code zu nutzen, musst du Tools manuell aktivieren:

1. **Tools-Einstellungen öffnen** - Klicke auf das Zahnrad-Symbol in der Sidebar
2. **Selektiv aktivieren** - Aktiviere nur die benötigten Tools
3. **Einstellungen anwenden** - Deine Präferenzen werden lokal gespeichert

<div align="center">

![Tools-Einstellungen Modal](public/screenshots/tools-modal.png)
*Tools-Einstellungen Oberfläche - aktiviere nur was du brauchst*

</div>

**Empfohlener Ansatz**: Beginne mit aktivierten Basis-Tools und füge weitere bei Bedarf hinzu. Du kannst diese Einstellungen jederzeit anpassen.

---

## Plugins

CloudCLI hat ein Plugin-System, das dir ermöglicht, benutzerdefinierte Tabs mit eigenem Frontend-UI und optionalem Node.js-Backend hinzuzufügen. Installiere Plugins aus Git-Repos direkt in **Settings > Plugins** oder erstelle deine eigenen.

### Verfügbare Plugins

| Plugin | Beschreibung |
|---|---|
| **[Project Stats](https://github.com/cloudcli-ai/cloudcli-plugin-starter)** | Zeigt Dateianzahl, Codezeilen, Dateityp-Verteilung, größte Dateien und kürzlich geänderte Dateien für dein aktuelles Projekt |
| **[Web Terminal](https://github.com/cloudcli-ai/cloudcli-plugin-terminal)** | Vollständiges xterm.js Terminal mit Multi-Tab-Unterstützung |

### Eigenes erstellen

**[Plugin Starter Template →](https://github.com/cloudcli-ai/cloudcli-plugin-starter)** — Forke dieses Repo um dein eigenes Plugin zu erstellen. Enthält ein funktionierendes Beispiel mit Frontend-Rendering, Live-Context-Updates und RPC-Kommunikation zu einem Backend-Server.

**[Plugin-Dokumentation →](https://cloudcli.ai/docs/plugin-overview)** — vollständiger Guide zur Plugin-API, Manifest-Format, Sicherheitsmodell und mehr.

---
## FAQ

<details>
<summary>Wie unterscheidet sich das von Claude Code Remote Control?</summary>

Claude Code Remote Control lässt dich Nachrichten an eine Sitzung senden, die bereits in deinem lokalen Terminal läuft. Deine Maschine muss an bleiben, dein Terminal muss offen bleiben, und Sitzungen timeouten nach etwa 10 Minuten ohne Netzwerkverbindung.

CloudCLI UI und CloudCLI Cloud erweitern Claude Code, anstatt daneben zu sitzen — deine MCP-Server, Berechtigungen, Einstellungen und Sitzungen sind exakt dieselben, die Claude Code nativ nutzt. Nichts wird dupliziert oder separat verwaltet.

Das bedeutet in der Praxis:

- **Alle deine Sitzungen, nicht nur eine** — CloudCLI UI entdeckt automatisch jede Sitzung aus deinem `~/.claude` Ordner. Remote Control stellt nur die einzelne aktive Sitzung bereit, um sie in der Claude Mobile-App verfügbar zu machen.
- **Deine Einstellungen sind deine Einstellungen** — MCP-Server, Tool-Berechtigungen und Projekt-Konfiguration, die du in CloudCLI UI änderst, werden direkt in dein Claude Code Config geschrieben und treten sofort in Kraft, und umgekehrt.
- **Funktioniert mit mehr Agents** — Claude Code, Cursor CLI, Codex und Gemini CLI, nicht nur Claude Code.
- **Volle UI, nicht nur ein Chat-Fenster** — Datei-Explorer, Git-Integration, MCP-Verwaltung und Shell-Terminal sind alle eingebaut.
- **CloudCLI Cloud läuft in der Cloud** — schließe deinen Laptop, der Agent läuft weiter. Kein Terminal zum Überwachen, keine Maschine die an bleiben muss.

</details>

<details>
<summary>Muss ich separat für ein KI-Abo bezahlen?</summary>

Ja. CloudCLI stellt die Umgebung bereit, nicht die KI. Du bringst dein eigenes Claude, Cursor, Codex oder Gemini Abo mit. CloudCLI Cloud bietet die Hosting-Umgebung ab $7/Monat zusätzlich dazu.

</details>

<details>
<summary>Kann ich CloudCLI UI auf meinem Handy nutzen?</summary>

Ja. Für Selbst-Hosting, starte den Server auf deiner Maschine und öffne `[yourip]:port` in einem beliebigen Browser in deinem Netzwerk. Für CloudCLI Cloud, öffne es von jedem Gerät — kein VPN, kein Port-Forwarding, kein Setup. Eine native App ist auch in Entwicklung.

</details>

<details>
<summary>Werden Änderungen, die ich in der UI mache, mein lokales Claude Code Setup beeinflussen?</summary>

Ja, für Selbst-Hosting. CloudCLI UI liest und schreibt in dasselbe `~/.claude` Config, das Claude Code nativ nutzt. MCP-Server, die du über die UI hinzufügst, erscheinen sofort in Claude Code und umgekehrt.

</details>

---

## Community & Support

- **[Dokumentation](https://cloudcli.ai/docs)** — Installation, Konfiguration, Features und Fehlerbehebung
- **[Discord](https://discord.gg/buxwujPNRE)** — Hilfe erhalten und mit anderen Nutzern verbinden
- **[GitHub Issues](https://github.com/siteboon/claudecodeui/issues)** — Fehlerberichte und Feature-Anfragen
- **[Contributing Guide](CONTRIBUTING.md)** — wie man zum Projekt beiträgt

## Lizenz

GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later) — siehe [LICENSE](LICENSE) für den vollständigen Text.

Dieses Projekt ist Open Source und kann unter der AGPL-3.0-or-later Lizenz frei verwendet, modifiziert und verbreitet werden. Wenn du diese Software modifizierst und als Netzwerkdienst betreibst, musst du den modifizierten Quellcode den Nutzern dieses Dienstes zur Verfügung stellen.

## Danksagungen

### Erstellt mit
- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** - Anthropics offizielles CLI
- **[Cursor CLI](https://docs.cursor.com/en/cli/overview)** - Cursors offizielles CLI
- **[Codex](https://developers.openai.com/codex)** - OpenAI Codex
- **[Gemini-CLI](https://geminicli.com/)** - Google Gemini CLI
- **[React](https://react.dev/)** - User-Interface-Bibliothek
- **[Vite](https://vitejs.dev/)** - Schnelles Build-Tool und Dev-Server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS-Framework
- **[CodeMirror](https://codemirror.net/)** - Fortgeschrittener Code-Editor
- **[TaskMaster AI](https://github.com/eyaltoledano/claude-task-master)** *(Optional)* - KI-gestütztes Projektmanagement und Aufgabenplanung


### Sponsoren
- [Siteboon - AI powered website builder](https://siteboon.ai)
---

<div align="center">
  <strong>Mit Sorgfalt für die Claude Code, Cursor und Codex Community erstellt.</strong>
</div>
