# Obsidian Daily Notes Prefix Matcher

[English](#english) | [中文](#中文)

## English

An Obsidian plugin that opens today’s daily note by matching the date prefix in the filename.

Obsidian’s built-in Daily Notes feature normally looks for an exact filename such as:

```text
2026-07-28.md
```

This plugin also recognizes descriptive filenames that start with the same date, for example:

```text
2026-07-28火 知识大整理.md
2026-07-28读书笔记.md
```

### Features

- Search for today’s note by the configured Daily Notes date format.
- Match Markdown files whose filename starts with today’s date.
- Prefer a descriptive note over an empty exact-date placeholder.
- Show a picker when multiple descriptive notes match.
- Create the standard exact-date note when no matching note exists.
- Keep the configured Daily Notes folder and date format.
- Provide both a ribbon icon and a Command Palette command.

### Usage

1. Install and enable the plugin.
2. Click the calendar icon in the left ribbon, or open the Command Palette.
3. Run **Open today's daily note by prefix**.

The plugin reads the folder and date format from Obsidian’s core Daily Notes settings. For example:

```json
{
  "folder": "Life/日记",
  "format": "YYYY-MM-DD"
}
```

### Matching behavior

If the folder contains:

```text
2026-07-28.md
2026-07-28火 知识大整理.md
```

the descriptive note is preferred. If there are several descriptive notes, the plugin lets you choose one. If no file starts with today’s date, it creates the standard `YYYY-MM-DD.md` note.

### Installation

#### Community Plugins

After the plugin is accepted by the Obsidian Community Plugins directory:

1. Open **Settings → Community plugins**.
2. Search for **Daily Notes Prefix Matcher**.
3. Install and enable it.

#### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` if provided from the latest GitHub release.
2. Create a folder named `daily-prefix-notes` under `<your-vault>/.obsidian/plugins/`.
3. Copy the downloaded files into that folder.
4. Reload Obsidian and enable the plugin.

### Compatibility

- Obsidian desktop and mobile should be supported.
- Minimum Obsidian version: 1.5.0.
- No external service or network access is required.

### License

MIT License. See [LICENSE](LICENSE).

## 中文

一个用于 Obsidian 的日记插件。它会按照文件名中的日期前缀查找并打开当天的日记。

Obsidian 自带的 Daily Notes 通常只会精确查找：

```text
2026-07-28.md
```

本插件同时支持以日期开头、后面带有自定义标题的日记文件，例如：

```text
2026-07-28火 知识大整理.md
2026-07-28读书笔记.md
```

### 功能

- 使用 Obsidian 日记设置中的日期格式查找当天日记。
- 匹配文件名以当天日期开头的 Markdown 文件。
- 如果同时存在标准日期文件和带标题的日记，优先打开带标题的日记。
- 存在多篇带标题的当天日记时，弹出选择列表。
- 找不到匹配文件时，创建标准的日期文件。
- 沿用 Obsidian 核心 Daily Notes 的日记目录和日期格式。
- 提供左侧功能条按钮和命令面板命令。

### 使用方法

1. 安装并启用插件。
2. 点击左侧功能条中的日历图标，或打开命令面板。
3. 执行 **打开今天的日记（按日期前缀匹配）**。

插件会读取 Obsidian 核心 Daily Notes 的目录和日期格式。例如：

```json
{
  "folder": "Life/日记",
  "format": "YYYY-MM-DD"
}
```

### 匹配规则

如果目录中存在：

```text
2026-07-28.md
2026-07-28火 知识大整理.md
```

插件会优先打开带有具体标题的日记。如果有多篇带标题的日记，会让你选择要打开的文件。如果当天没有任何文件以日期开头，则创建标准的 `YYYY-MM-DD.md` 文件。

### 安装方式

#### 社区插件

插件被 Obsidian 社区插件目录收录后：

1. 打开 **设置 → 社区插件**。
2. 搜索 **Daily Notes Prefix Matcher**。
3. 安装并启用插件。

#### 手动安装

1. 从 GitHub 最新 Release 下载 `main.js`、`manifest.json`，以及发布包中提供的 `styles.css`。
2. 在 `<你的 Vault>/.obsidian/plugins/` 下创建 `daily-prefix-notes` 文件夹。
3. 将下载的文件复制到该文件夹。
4. 重载 Obsidian 并启用插件。

### 兼容性

- 支持 Obsidian 桌面端和移动端。
- 最低 Obsidian 版本：1.5.0。
- 不需要外部服务，也不会访问网络。

### 开源协议

本项目使用 MIT License，详见 [LICENSE](LICENSE)。
