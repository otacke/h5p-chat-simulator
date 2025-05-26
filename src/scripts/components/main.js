import ChatPanel from '@components/chat-panel/chat-panel.js';
import Util from '@services/util.js';
import './main.scss';

/** @constant {number} DELAY_BETWEEN_CHAT_PANELS_MS Delay between showing chat panels. */
const DELAY_BETWEEN_CHAT_PANELS_MS = 500;

/**
 * Main DOM component
 */
export default class Main {
  /**
   * @class
   * @param {object} [params] Parameters.
   * @param {object} [callbacks] Callbacks for events.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({ messages: [] }, params);
    this.callbacks = Util.extend({ scrollToBottom: () => {} }, callbacks);

    this.chatPanels = this.params.messages.map((message, index) => this.buildChatPanel(message, index));

    this.dom = this.buildDOM();

    this.start();
  }

  /**
   * Build a chat panel.
   * @param {object} message Message object.
   * @param {number} index Index of the message.
   * @returns {ChatPanel} The chat panel instance.
   */
  buildChatPanel(message, index) {
    return new ChatPanel(
      {
        message: message,
        dictionary: this.params.dictionary,
        globals: this.params.globals
      },
      {
        onShowingProcessDone: () => {
          this.handleChatPanelShowingProcessDone(index);
        }
      }
    );
  }

  /**
   * Build the main DOM structure.
   * @returns {HTMLElement} The main DOM element.
   */
  buildDOM() {
    const dom = document.createElement('div');
    dom.classList.add('h5p-chat-simulator-main');

    const panels = document.createElement('ul');
    panels.classList.add('h5p-chat-simulator-chat-panels');
    dom.appendChild(panels);

    this.chatPanels.forEach((chatPanel) => {
      panels.appendChild(chatPanel.getDOM());
    });

    return dom;
  }

  /**
   * Get the main DOM element.
   * @returns {HTMLElement} The main DOM element.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Start the chat simulator by showing the first chat panel once in viewport.
   */
  start() {
    Util.callOnceVisible(this.dom, () => {
      this.showChatPanel(0, 0);
    });
  }

  /**
   * Show a chat panel with a delay.
   * @param {number} index Index of the chat panel to show.
   * @param {number} [delay] Delay before showing the chat panel, defaults to DELAY_BETWEEN_CHAT_PANELS_MS.
   */
  showChatPanel(index, delay = DELAY_BETWEEN_CHAT_PANELS_MS) {
    if (index < 0 || index >= this.chatPanels.length) {
      return;
    }

    window.clearTimeout(this.showChatPanelTimeout);
    this.showChatPanelTimeout = window.setTimeout(() => {
      this.chatPanels[index].showWithAnimation();
      this.callbacks.scrollToBottom();
    }, delay);
  }

  /**
   * Handle the completion of the chat panel showing process.
   * @param {number} index Index of the chat panel that finished showing.
   */
  handleChatPanelShowingProcessDone(index) {
    this.callbacks.scrollToBottom();

    const nextIndex = index + 1;
    if (nextIndex >= this.chatPanels.length) {
      return;
    }

    this.showChatPanel(nextIndex);
  }

  /**
   * Reset the chat panels.
   */
  reset() {
    window.clearTimeout(this.showChatPanelTimeout);

    this.chatPanels.forEach((chatPanel) => {
      chatPanel.reset();
    });

    this.start();
  }
}
