import Util from '@services/util.js';
import './chat-panel.scss';

/** @constant {number} DELAY_PER_CHAR_MS Time to delay showing the question per character. */
const DELAY_PER_CHAR_MS = 40;

/** @constant {number} MAX_DELAY_TYPING_ANIMATION_MS Maximum time to delay showing the text. */
const MAX_DELAY_TYPING_ANIMATION_MS = 2500;

/** @constant {number} NUMBER_OF_TYPING_DOTS Number of dots in the typing animation. */
const NUMBER_OF_TYPING_DOTS = 3;

const computeTypingAnimationDelay = (textLength) => {
  return Math.min(textLength * DELAY_PER_CHAR_MS, MAX_DELAY_TYPING_ANIMATION_MS);
};

export default class ChatPanel {

  /**
   * @class
   * @param {object} [params] Parameters for the chat panel.
   * @param {object} [callbacks] Callbacks for events.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = Util.extend({ message: {} }, params);

    this.callbacks = Util.extend({
      onShowingProcessDone: () => {}
    }, callbacks);

    this.dom = this.buildDOM();
    this.setIconImage(this.params.message.iconImage);
    this.hide();
  }

  setIconImage(iconImage) {
    if (!iconImage?.path) {
      return;
    }

    const src = H5P.getPath(iconImage.path, this.params.globals.get('contentId'));
    if (!src) {
      return;
    }

    // Setting the pseudo element's content property as a custom CSS property with " " fails. Setting " " via CSS class.
    this.dom.classList.add('has-icon');

    this.dom.style.setProperty('--chat-panel-icon-image', `url('${src}')`);
  }

  /**
   * Build the DOM structure for the chat panel.
   * @returns {HTMLElement} The DOM element for the chat panel.
   */
  buildDOM() {
    const dom = document.createElement('li');
    dom.classList.add('h5p-chat-simulator-chat-panel');

    this.bubble = document.createElement('div');
    this.bubble.classList.add('h5p-chat-simulator-chat-bubble');
    this.bubble.classList.add(this.params.message.overrides.origin);
    this.bubble.style.setProperty('--chat-panel-background-color', this.params.message.backgroundColor);
    this.bubble.style.setProperty('--chat-panel-text-color', this.params.message.textColor);

    dom.appendChild(this.bubble);

    return dom;
  }

  /**
   * Get the DOM element.
   * @returns {HTMLElement} The DOM element.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Start the chat panel showing process with animation.
   */
  showWithAnimation() {
    this.setContentToTypingDots();
    this.dom.classList.remove('display-none');
    this.params.globals.get('resize')();

    const delayTypingAnimation = computeTypingAnimationDelay(this.params.message.text.length);
    window.clearTimeout(this.showWithTextTimeout);
    this.showWithTextTimeout = window.setTimeout(() => {
      this.showWithText();
    }, delayTypingAnimation);
  }

  /**
   * Show the chat bubble with the message text.
   * @param {string} [text] The text to display in the chat bubble, defaults to this.params.message.text.
   */
  showWithText(text = this.params.message.text) {
    this.setContentToText(text);
    this.show();
  }

  /**
   * Show.
   */
  show() {
    this.dom.classList.remove('display-none');
    this.params.globals.get('resize')();

    this.params.globals.get('read')(this.buildARIALiveRegionMessage());

    this.callbacks.onShowingProcessDone();
  }

  /**
   * Build the ARIA live region message for accessibility.
   * @returns {string} The ARIA live region message.
   */
  buildARIALiveRegionMessage() {
    const intro = (this.params.message.userName) ?
      this.params.dictionary.get('a11y.newMessageFrom').replace('@username', this.params.message.userName) :
      this.params.dictionary.get('a11y.newMessage');

    return `${intro}: ${this.params.message.text}`;
  }

  /**
   * Hide.
   */
  hide() {
    this.dom.classList.add('display-none');
  }

  /**
   * Set the content of the chat bubble to the typing dots.
   * @param {number} [number] Number of typing dots to create, defaults to NUMBER_OF_TYPING_DOTS.
   */
  setContentToTypingDots(number = NUMBER_OF_TYPING_DOTS) {
    this.bubble.innerText = '';
    this.typingDots = this.typingDots || this.buildTypingDots(number);
    this.bubble.append(this.typingDots);
  }

  /**
   * Build the typing dots for the typing animation.
   * @param {number} [number] Number of typing dots to create, defaults to NUMBER_OF_TYPING_DOTS.
   * @returns {HTMLElement} The DOM element containing the typing dots.
   */
  buildTypingDots(number = NUMBER_OF_TYPING_DOTS) {
    const typingDots = document.createElement('div');
    typingDots.classList.add('typing-animation-dots');

    for (let i = 0; i < number; i++) {
      const typingDot = document.createElement('div');
      typingDot.classList.add('typing-animation-dot');
      typingDots.append(typingDot);
    }

    return typingDots;
  }

  /**
   * Build the message DOM structure.
   * @param {string} [text] The text to display in the message, defaults to this.params.message.text.
   * @returns {HTMLElement} The DOM element for the message.
   */
  buildMessageDOM(text = this.params.message.text) {
    const messageDOM = document.createElement('div');
    messageDOM.classList.add('h5p-chat-simulator-message');
    if (this.params.message.userName) {
      const userNameDOM = document.createElement('div');
      userNameDOM.classList.add('h5p-chat-simulator-message-user-name');
      userNameDOM.innerText = this.params.message.userName;
      messageDOM.appendChild(userNameDOM);
    }

    const messageTextDOM = document.createElement('div');
    messageTextDOM.classList.add('h5p-chat-simulator-message-text');
    messageTextDOM.innerText = text;
    messageDOM.appendChild(messageTextDOM);

    return messageDOM;
  }

  /**
   * Set the content of the chat bubble to the message text.
   * @param {string} [text] The text to set in the chat bubble, defaults to this.params.message.text.
   */
  setContentToText(text = this.params.message.text) {
    this.bubble.innerText = '';
    const messageDOM = this.buildMessageDOM(text);
    this.bubble.appendChild(messageDOM);
  }

  /**
   * Reset the chat panel.
   */
  reset() {
    window.clearTimeout(this.showWithTextTimeout);

    this.hide();
  }
}
