const { Plugin, Notice, normalizePath, FuzzySuggestModal } = require('obsidian');

class DailyNotePicker extends FuzzySuggestModal {
  constructor(app, files, onChoose) {
    super(app);
    this.files = files;
    this.onChoose = onChoose;
    this.setPlaceholder('今天有多篇日记，请选择要打开的一篇');
  }
  getItems() { return this.files; }
  getItemText(file) { return file.basename; }
  onChooseItem(file) { this.onChoose(file); }
}

module.exports = class DailyPrefixNotesPlugin extends Plugin {
  async onload() {
    this.addRibbonIcon('calendar', '打开今天的日记（按日期前缀匹配）', () => {
      this.openDailyNoteByPrefix();
    });
    this.addCommand({
      id: 'open-todays-daily-note-by-prefix',
      name: '打开今天的日记（按日期前缀匹配）',
      callback: () => this.openDailyNoteByPrefix(),
    });
  }

  getDailyNotesOptions() {
    const plugin = this.app.internalPlugins?.getPluginById('daily-notes');
    const options = plugin?.instance?.options || plugin?.instance?.settings || {};
    return {
      folder: options.folder || 'Life/日记',
      format: options.format || 'YYYY-MM-DD',
    };
  }

  async openFile(file) {
    await this.app.workspace.getLeaf(false).openFile(file);
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
      // Prefer a descriptive filename over a leftover exact-date placeholder.
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
      const file = await this.app.vault.create(path, '');
      await this.openFile(file);
    } catch (error) {
      new Notice(`无法创建今日日记：${error.message}`);
      console.error('Daily Notes Prefix Matcher:', error);
    }
  }
};
