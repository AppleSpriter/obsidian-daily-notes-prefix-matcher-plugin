const {
  Plugin,
  Notice,
  normalizePath,
  FuzzySuggestModal,
  PluginSettingTab,
  Setting,
} = require('obsidian');

const DEFAULT_DAILY_NOTE_FOLDER = 'life/日记';
const FALLBACK_DATE_FORMAT = 'YYYY-MM-DD';
const DEFAULT_FOLLOW_CORE_DAILY_NOTES = true;

function isChineseLocale(app) {
  const locale = app?.vault?.getConfig?.('locale') || window.moment?.locale?.() || '';
  return String(locale).toLowerCase().startsWith('zh');
}

function t(app, chinese, english) {
  return isChineseLocale(app) ? chinese : english;
}

class DailyNotePicker extends FuzzySuggestModal {
  constructor(app, files, onChoose) {
    super(app);
    this.files = files;
    this.onChoose = onChoose;
    this.setPlaceholder(t(app, '今天有多篇日记，请选择要打开的一篇', 'There are multiple daily notes today. Choose one to open.'));
  }
  getItems() { return this.files; }
  getItemText(file) { return file.basename; }
  onChooseItem(file) { this.onChoose(file); }
}

class DailyPrefixNotesSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: t(this.app, '日记前缀匹配设置', 'Daily Notes Prefix Matcher') });
    new Setting(containerEl)
      .setName(t(this.app, '跟随核心日记路径', 'Follow core Daily Notes path'))
      .setDesc(t(this.app, '开启后自动读取核心“日记”的目录和日期格式；关闭后使用下方自定义路径。', 'Use the core Daily Notes folder and date format when enabled; use the custom path below when disabled.'))
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.followCoreDailyNotes)
        .onChange(async (value) => {
          this.plugin.settings.followCoreDailyNotes = value;
          await this.plugin.saveData(this.plugin.settings);
          this.display();
        }));

    const active = this.plugin.getDailyNotesOptions();
    const activePath = normalizePath(`${active.folder === '/' ? '' : `${active.folder}/`}${window.moment().format(active.format)}.md`);
    new Setting(containerEl)
      .setName(t(this.app, '当前生效路径', 'Resolved daily-note path'))
      .setDesc(t(this.app, '当天实际匹配的目录和标准文件路径。', 'The folder and standard file path currently used for today.'))
      .addText((text) => text.setValue(activePath).setDisabled(true));

    new Setting(containerEl)
      .setName(t(this.app, '自定义日记路径', 'Custom daily-note path'))
      .setDesc(t(this.app, '关闭“跟随核心日记路径”时使用。支持路径中的 YYYY、MM、DD，例如 Life/日记/YYYY 年日记/MM月。只匹配解析后最后一级目录下的文件。', 'Used when following is disabled. Supports YYYY, MM, and DD in the path, for example Life/日记/YYYY 年日记/MM月. Only files directly under the resolved final folder are matched.'))
      .addText((text) => text
        .setPlaceholder(DEFAULT_DAILY_NOTE_FOLDER)
        .setValue(this.plugin.settings.dailyNoteFolder)
        .setDisabled(this.plugin.settings.followCoreDailyNotes)
        .onChange(async (value) => {
          const nextFolder = normalizePath(value.trim()) || DEFAULT_DAILY_NOTE_FOLDER;
          this.plugin.settings.dailyNoteFolder = nextFolder;
          await this.plugin.saveData(this.plugin.settings);
          this.display();
        }));
  }
}

module.exports = class DailyPrefixNotesPlugin extends Plugin {
  async onload() {
    const savedSettings = await this.loadData();
    const coreOptions = this.getCoreDailyNotesOptions();
    const savedFolder = normalizePath(savedSettings?.dailyNoteFolder || '');
    const initialFolder = (!savedFolder || (savedFolder === DEFAULT_DAILY_NOTE_FOLDER && coreOptions.folder))
      ? (coreOptions.folder || DEFAULT_DAILY_NOTE_FOLDER)
      : savedFolder;
    this.settings = {
      followCoreDailyNotes: savedSettings?.followCoreDailyNotes ?? DEFAULT_FOLLOW_CORE_DAILY_NOTES,
      dailyNoteFolder: normalizePath(savedSettings?.dailyNoteFolder || initialFolder),
    };
    if (this.settings.dailyNoteFolder && this.settings.dailyNoteFolder !== savedFolder) {
      await this.saveData(this.settings);
    }
    this.addSettingTab(new DailyPrefixNotesSettingTab(this.app, this));
    this.addRibbonIcon('calendar', t(this.app, '打开今天的日记（按日期前缀匹配）', "Open today's daily note by prefix"), () => {
      this.openDailyNoteByPrefix();
    });
    this.addCommand({
      id: 'open-todays-daily-note-by-prefix',
      name: t(this.app, '打开今天的日记（按日期前缀匹配）', "Open today's daily note by prefix"),
      callback: () => this.openDailyNoteByPrefix(),
    });
  }

  getCoreDailyNotesOptions() {
    const plugin = this.app.internalPlugins?.getPluginById('daily-notes');
    return plugin?.instance?.options || plugin?.instance?.settings || {};
  }

  resolveDatePath(path, date) {
    return normalizePath(String(path || DEFAULT_DAILY_NOTE_FOLDER)
      .replace(/YYYY/g, date.format('YYYY'))
      .replace(/MM/g, date.format('MM'))
      .replace(/DD/g, date.format('DD')));
  }

  getDailyNotesOptions() {
    const plugin = this.app.internalPlugins?.getPluginById('daily-notes');
    const coreEnabled = plugin?.enabled === true;
    const options = this.getCoreDailyNotesOptions();
    const date = window.moment();
    if (this.settings.followCoreDailyNotes && coreEnabled) {
      // Obsidian's Daily Notes format may itself contain folders, e.g.
      // "YYYY 年日记/MM月/YYYY-MM-DD". The final segment is the filename
      // format; preceding segments are date-dependent subfolders.
      const renderedFormat = this.resolveDatePath(options.format || FALLBACK_DATE_FORMAT, date);
      const separator = renderedFormat.lastIndexOf('/');
      const relativeFolder = separator >= 0 ? renderedFormat.slice(0, separator) : '';
      const fileFormat = separator >= 0 ? renderedFormat.slice(separator + 1) : renderedFormat;
      const baseFolder = this.resolveDatePath(options.folder || '', date);
      return {
        folder: normalizePath([baseFolder, relativeFolder].filter(Boolean).join('/')) || '/',
        format: fileFormat || FALLBACK_DATE_FORMAT,
      };
    }
    return {
      folder: this.resolveDatePath(this.settings.dailyNoteFolder || DEFAULT_DAILY_NOTE_FOLDER, date),
      format: FALLBACK_DATE_FORMAT,
    };
  }

  async openFile(file) {
    await this.app.workspace.getLeaf(false).openFile(file);
  }

  async ensureFolder(folder) {
    if (!folder || folder === '/') return;
    let current = '';
    for (const part of folder.split('/')) {
      current = current ? `${current}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(current)) {
        await this.app.vault.createFolder(current);
      }
    }
  }

  async openDailyNoteByPrefix() {
    const { folder, format } = this.getDailyNotesOptions();
    const prefix = window.moment().format(format);
    const normalizedFolder = normalizePath(folder || '/');
    const folderPrefix = normalizedFolder === '/' ? '' : `${normalizedFolder}/`;

    // The resolved folder is the final directory for today's notes. Match
    // only files directly below it, so older year/month folders do not leak
    // into today's result.
    const matches = this.app.vault.getMarkdownFiles()
      .filter((file) => file.path.startsWith(folderPrefix))
      .filter((file) => !file.path.slice(folderPrefix.length).includes('/'))
      .filter((file) => file.basename.startsWith(prefix))
      .sort((a, b) => a.basename.localeCompare(b.basename, 'zh-CN'));

    if (matches.length === 1) {
      await this.openFile(matches[0]);
      return;
    }

    if (matches.length > 1) {
      const descriptive = matches.filter((file) => file.basename !== prefix);
      if (descriptive.length === 1) {
        await this.openFile(descriptive[0]);
        return;
      }
      new DailyNotePicker(this.app, descriptive.length ? descriptive : matches,
        (file) => this.openFile(file)).open();
      return;
    }

    const path = normalizePath(`${folderPrefix}${prefix}.md`);
    try {
      if (folderPrefix) await this.ensureFolder(normalizedFolder);

      // Re-check after folder creation: another plugin may have created the
      // note while we were preparing the folder tree.
      const existing = this.app.vault.getAbstractFileByPath(path);
      if (existing) {
        await this.openFile(existing);
        return;
      }

      let file;
      try {
        file = await this.app.vault.create(path, '');
      } catch (error) {
        // Treat a create race as success if the other creator left the file.
        const raced = this.app.vault.getAbstractFileByPath(path);
        if (!raced) throw error;
        file = raced;
      }
      await this.openFile(file);
    } catch (error) {
      new Notice(t(this.app, `无法创建今日日记：${error.message}`, `Unable to create today's daily note: ${error.message}`));
      console.error('Daily Notes Prefix Matcher:', error);
    }
  }
};
