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
      .setName(t(this.app, '备用日记位置', 'Fallback daily-note folder'))
      .setDesc(t(this.app, '仅当核心插件“日记”关闭时使用；可以自定义为 Vault 内的其他目录。', 'Used only when Obsidian’s core Daily Notes plugin is disabled. You can choose any folder in your vault.'))
      .addText((text) => text
        .setPlaceholder(DEFAULT_DAILY_NOTE_FOLDER)
        .setValue(this.plugin.settings.dailyNoteFolder)
        .onChange(async (value) => {
          const nextFolder = normalizePath(value.trim()) || DEFAULT_DAILY_NOTE_FOLDER;
          this.plugin.settings.dailyNoteFolder = nextFolder;
          await this.plugin.saveData(this.plugin.settings);
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
      dailyNoteFolder: normalizePath(initialFolder),
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

  getDailyNotesOptions() {
    const plugin = this.app.internalPlugins?.getPluginById('daily-notes');
    const coreEnabled = plugin?.enabled === true;
    const options = this.getCoreDailyNotesOptions();
    if (!coreEnabled) {
      return { folder: this.settings.dailyNoteFolder || DEFAULT_DAILY_NOTE_FOLDER, format: FALLBACK_DATE_FORMAT };
    }
    return {
      folder: options.folder || DEFAULT_DAILY_NOTE_FOLDER,
      format: options.format || FALLBACK_DATE_FORMAT,
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
      const file = await this.app.vault.create(path, '');
      await this.openFile(file);
    } catch (error) {
      new Notice(t(this.app, `无法创建今日日记：${error.message}`, `Unable to create today's daily note: ${error.message}`));
      console.error('Daily Notes Prefix Matcher:', error);
    }
  }
};
