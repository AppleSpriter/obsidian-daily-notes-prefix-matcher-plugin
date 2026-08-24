# Obsidian Daily Notes Prefix Matcher

[English](#english) | [中文](#中文)

## English

An Obsidian plugin that opens today’s daily note by matching the date prefix in its filename.

### Features

- Match Markdown notes whose filename starts with today’s date.
- Prefer a descriptive note over an empty exact-date placeholder.
- Show a picker when multiple descriptive notes match.
- Follow the core Daily Notes folder and date format when enabled.
- Use an independent custom folder path when following is disabled.
- Support `YYYY`, `MM`, and `DD` placeholders in custom folder paths.
- Resolve folder segments from a core Daily Notes format such as `YYYY Year Notes/MM Month/YYYY-MM-DD`.
- Display the fully resolved path currently used for today.
- Match only files directly inside the resolved final folder, avoiding cross-month and cross-year matches.
- Handle races with the core Daily Notes and Templater plugins when creating a missing note.
- Provide both a ribbon icon and a Command Palette command.
- Switch user-visible UI text between Chinese and English based on Obsidian’s interface language.

### Settings

Open **Settings → Daily Notes Prefix Matcher**.

#### Follow core Daily Notes path

- **Enabled:** read the folder and date format from Obsidian’s core Daily Notes plugin.
- **Disabled:** use the custom daily-note path below and the fallback filename format `YYYY-MM-DD`.
- **Resolved daily-note path:** shows the complete standard path for today.

#### Custom daily-note path

When following is disabled, enter a folder template containing any of these placeholders:

```text
Life/Daily Notes/YYYY Year Notes/MM Month
```

On August 24, 2026, this resolves to:

```text
Life/Daily Notes/2026 Year Notes/08 Month
```

Another example:

```text
Daily Notes/YYYY/MM/DD
```

resolves to:

```text
Daily Notes/2026/08/24
```

Only files directly inside the resolved final folder are matched.

### Core Daily Notes format

The plugin supports a core Daily Notes configuration where the date format contains folders, for example:

```json
{
  "folder": "Life/Daily Notes",
  "format": "YYYY Year Notes/MM Month/YYYY-MM-DD"
}
```

The plugin splits the format into:

- Folder: `Life/Daily Notes/2026 Year Notes/08 Month`
- Filename format: `YYYY-MM-DD`

### Matching behavior

If the resolved folder contains:

```text
2026-08-24.md
2026-08-24 Tuesday knowledge review.md
2026-08-24 reading notes.md
```

the descriptive note is preferred. If there are several descriptive notes, the plugin lets you choose one. If no file starts with today’s date, it creates the standard date file in the resolved folder.

### Usage

1. Install and enable the plugin.
2. Choose whether to follow the core Daily Notes path.
3. Click the calendar icon in the left ribbon, or open the Command Palette.
4. Run **Open today's daily note by prefix**.

### Installation

#### Community Plugins

After the plugin is accepted by the Obsidian Community Plugins directory:

1. Open **Settings → Community plugins**.
2. Search for **Daily Notes Prefix Matcher**.
3. Install and enable it.

#### Manual installation

1. Download `main.js` and `manifest.json` from the latest GitHub release.
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

一个用于按日期前缀打开日记的 Obsidian 插件。

### 功能

- 按当前日期前缀匹配 Markdown 日记，例如 `2026-08-24月.md`。
- 如果同时存在标准日期文件和带标题的日记，优先打开带标题的日记。
- 存在多篇带标题的当天日记时，弹出选择列表。
- 核心 Daily Notes 开启时，可选择跟随核心日记的目录和日期格式。
- 关闭跟随开关或核心日记插件关闭时，使用插件自己的日记路径。
- 自定义路径支持 `YYYY`、`MM`、`DD` 占位符。
- 支持核心日记格式中包含目录，例如 `YYYY 年日记/MM月/YYYY-MM-DD`。
- 设置页显示当天实际生效的完整路径。
- 只在解析后的最后一级目录中匹配，避免跨月份或跨年份误匹配。
- 与核心 Daily Notes 或 Templater 同时创建文件时，能够处理文件已存在的竞态。
- 提供左侧功能条按钮和命令面板命令。
- 根据 Obsidian 界面语言切换插件的中英文界面文案。

### 设置

打开 **设置 → 日记前缀匹配设置**。

#### 跟随核心日记路径

- **开启：** 读取 Obsidian 核心 Daily Notes 的目录和日期格式。
- **关闭：** 使用下方的自定义日记路径，文件名格式使用 `YYYY-MM-DD`。
- **当前生效路径：** 显示今天实际使用的完整标准路径。

#### 自定义日记路径

关闭跟随开关后，可以填写包含日期占位符的路径模板：

```text
Life/日记/YYYY 年日记/MM月
```

2026 年 8 月 24 日解析为：

```text
Life/日记/2026 年日记/08月
```

也支持：

```text
日记/YYYY/MM/DD
```

解析为：

```text
日记/2026/08/24
```

插件只匹配解析后的最后一级目录下的文件。

### 核心日记格式

核心 Daily Notes 的日期格式可以包含目录，例如：

```json
{
  "folder": "Life/日记",
  "format": "YYYY 年日记/MM月/YYYY-MM-DD"
}
```

插件会自动拆分为：

- 路径：`Life/日记/2026 年日记/08月`
- 文件名格式：`YYYY-MM-DD`

### 匹配规则

如果解析后的目录中存在：

```text
2026-08-24.md
2026-08-24月.md
2026-08-24工作记录.md
```

插件会优先打开带有具体标题的日记。如果有多篇带标题的日记，会让你选择要打开的文件。如果当天没有任何文件以日期开头，则在解析后的目录中创建标准日期文件。

### 使用方法

1. 安装并启用插件。
2. 选择是否跟随核心日记路径。
3. 点击左侧功能条中的日历图标，或打开命令面板。
4. 执行 **打开今天的日记（按日期前缀匹配）**。

### 安装方式

#### 社区插件

插件被 Obsidian 社区插件目录收录后：

1. 打开 **设置 → 社区插件**。
2. 搜索 **Daily Notes Prefix Matcher**。
3. 安装并启用它。

#### 手动安装

1. 从最新 GitHub Release 下载 `main.js` 和 `manifest.json`。
2. 在 `<你的 Vault>/.obsidian/plugins/` 下创建 `daily-prefix-notes` 文件夹。
3. 将下载的文件复制到该文件夹。
4. 重载 Obsidian 并启用插件。

### 兼容性

- 支持 Obsidian 桌面端和移动端。
- 最低 Obsidian 版本：1.5.0。
- 不需要外部服务，也不会访问网络。

### 开源协议

本项目使用 MIT License，详见 [LICENSE](LICENSE)。
