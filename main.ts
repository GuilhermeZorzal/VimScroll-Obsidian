import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class VimScroll extends Plugin {
	settings: MyPluginSettings;


	async onload() {
		await this.loadSettings();

		document.addEventListener('keydown', this.handleKeyPress);
		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		document.removeEventListener('keydown', this.handleKeyPress);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	handleKeyPress = (event: KeyboardEvent) => {
		const activeLeaf = this.app.workspace.activeLeaf;

		// Check if there is an active markdown view
		if (activeLeaf && activeLeaf.view.getViewType() === 'markdown') {
		  const markdownView = activeLeaf.view as MarkdownView;
		  const mode = markdownView.getMode();

		  if (mode === 'preview') {
			// Scroll the preview pane
			if (event.key === 'j') {
			  this.scrollPreviewPane(60); // Scroll down by 30 pixels
			  event.preventDefault(); // Prevent default behavior
			} else if (event.key === 'k') {
			  this.scrollPreviewPane(-60); // Scroll up by 30 pixels
			  event.preventDefault(); // Prevent default behavior
			} else if (event.key === 'g') {
			  this.scrollPreviewPaneBeginning(); // Scroll up by 30 pixels
			  event.preventDefault(); // Prevent default behavior
			} 
			else if (event.key === 'G') {
			  this.scrollPreviewPaneEnd(); // Scroll up by 30 pixels
			  event.preventDefault(); // Prevent default behavior
			}
		  }
		}
	}
	async scrollPreviewPaneEnd() {
		let markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			const file = this.app.workspace.getActiveFile()
			const content = await (this.app as any).vault.cachedRead(file);
			const lines = content.split('\n');
			let numberOfLines = lines.length;
			//in preview mode don't count empty lines at the end
			if (markdownView.getMode() === 'preview') {
				while (numberOfLines > 0 && lines[numberOfLines - 1].trim() === '') {
					numberOfLines--;
				}
			}
			markdownView.currentMode.applyScroll((numberOfLines - 1))
		} 	  
	}
	async scrollPreviewPaneBeginning() {
		let markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			const preview = markdownView.previewMode;
			preview.applyScroll(0);
	  }
	}
	scrollPreviewPane(amount: number) {
		const activeLeaf = this.app.workspace.activeLeaf;
		if (!activeLeaf || activeLeaf.view.getViewType() !== 'markdown') return;

		const previewContainer = activeLeaf.view.containerEl.querySelector('.markdown-preview-view');
		if (previewContainer) {
		  previewContainer.scrollBy({
			top: amount,
			behavior: 'auto' 
		  });
		}
	  }
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: VimScroll;

	constructor(app: App, plugin: VimScroll) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
