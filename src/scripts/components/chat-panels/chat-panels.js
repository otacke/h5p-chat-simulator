import Util from '@services/util.js';
import ChatPanel from './chat-panel.js';
import './chat-panels.scss';

/** @constant {number} DELAY_BETWEEN_CHAT_PANELS_MS Delay between showing chat panels. */
const DELAY_BETWEEN_CHAT_PANELS_MS = 500;

export default class ChatPanels {

  /**
   * @class
   * @param {object} [params] Parameters for the chat panels.
   * @param {object} [callbacks] Callbacks for events.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = params;
    this.callbacks = Util.extend({
      onEnded: () => {}
    }, callbacks);

    this.lastChatPanelIndex = -1;
    this.isAutoplaying = false;

    this.instantiateChatPanels();

    this.dom = this.buildDOM();
  }

  /**
   * Instantiate chat panels based on the messages provided in params.
   */
  instantiateChatPanels() {
    this.chatPanels = this.params.messages.map((message, index) => this.buildChatPanel(message, index));
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
   * Handle the completion of the chat panel showing process.
   * @param {number} index Index of the chat panel that finished showing.
   */
  handleChatPanelShowingProcessDone(index) {
    this.scrollToBottom();

    const nextIndex = index + 1;
    if (nextIndex >= this.chatPanels.length) {
      this.callbacks.onEnded();
    }


    if (!this.isAutoplaying) {
      return;
    }

    this.showChatPanel(nextIndex);
  }

  /**
   * Scroll to the bottom of the chat panels container.
   */
  scrollToBottom() {
    window.requestAnimationFrame(() => {
      this.dom.scrollTop = this.dom.scrollHeight;
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
      this.lastChatPanelIndex = index;
      this.chatPanels[index].showWithAnimation();
      this.scrollToBottom();
    }, delay);
  }

  /**
   * Build the DOM for the chat panels container.
   * @returns {HTMLElement} The DOM element for the chat panels.
   */
  buildDOM() {
    const dom = document.createElement('ul');
    dom.classList.add('h5p-chat-simulator-chat-panels');

    if (this.params.behavior.maxHeight) {
      dom.style.setProperty('--max-height', `${this.params.behavior.maxHeight}px`);
      dom.classList.add('has-max-height');
    }

    if (this.params.behavior.fixedHeight) {
      dom.style.setProperty('--fixed-height', `${this.params.behavior.fixedHeight}px`);
    }

    this.chatPanels.forEach((chatPanel) => {
      dom.append(chatPanel.getDOM());
    });

    return dom;
  }

  /**
   * Start the chat simulator by showing the first chat panel once in viewport.
   */
  start() {
    Util.callOnceVisible(this.dom, () => {
      this.isAutoplaying = true;
      this.showChatPanel(this.lastChatPanelIndex + 1, 0);
    });
  }

  /**
   * Step to the next chat panel.
   */
  step() {
    this.completeCurrentChatPanel();
    this.showChatPanel(this.lastChatPanelIndex + 1, 0);
  }

  /**
   * Start autoplaying chat panels.
   */
  stop() {
    this.isAutoplaying = false;
    this.completeCurrentChatPanel();
  }

  /**
   * Toggle autoplaying chat panels.
   */
  toggleAutoplay() {
    if (this.isAutoplaying) {
      this.stop();
    }
    else {
      this.start(this.lastChatPanelIndex, 0);
    }
  }

  /**
   * Complete the current chat panel.
   */
  completeCurrentChatPanel() {
    this.chatPanels[this.lastChatPanelIndex]?.complete();
  }

  getDOM() {
    return this.dom;
  }

  /**
   * Reset the chat panels.
   */
  reset() {
    window.clearTimeout(this.showChatPanelTimeout);
    this.lastChatPanelIndex = -1;

    this.stop();

    this.chatPanels.forEach((chatPanel) => {
      chatPanel.reset();
    });
  }
}
