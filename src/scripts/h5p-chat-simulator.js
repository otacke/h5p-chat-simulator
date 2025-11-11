import MessageBox from '@components/message-box/message-box.js';
import Main from '@components/main.js';
import { getDefaultContrastColor } from '@services/color-util.js';
import Dictionary from '@services/dictionary.js';
import { getSemanticsDefaults } from '@services/h5p-util.js';
import Screenreader from '@services/screenreader.js';
import Util from '@services/util.js';
import '@styles/h5p-chat-simulator.scss';

/** @constant {string} DEFAULT_START_ORIGIN start origin for messages */
const DEFAULT_START_ORIGIN = 'right';

const screenreaderDOM = Screenreader.getDOM();

export default class ChatSimulator extends H5P.EventDispatcher {
  /**
   * @class
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super();

    this.params = this.sanitizeParams(params);

    this.params.visuals = this.addContrastColors(this.params.visuals);

    this.params.messages = this.rearrangeMessageOrigins(this.params.messages);
    this.params.messages = this.setMessageGlobals(this.params.messages, this.params.visuals);

    this.contentId = contentId;
    this.extras = extras;

    this.dictionary = new Dictionary();
    this.dictionary.fill({ l10n: this.params.l10n, a11y: this.params.a11y });

    this.globals = new Map();
    this.globals.set('contentId', this.contentId);
    this.globals.set('resize', () => {
      this.trigger('resize');
    });
    this.globals.set('read', (text) => {
      Screenreader.read(text);
    });

    this.main = new Main(
      {
        messages: this.params.messages,
        behavior: this.params.behaviour,
        dictionary: this.dictionary,
        globals: this.globals,
      },
    );
  }

  // TODO: play button only

  /**
   * Sanitize parameters.
   * @param {object} authorParams Parameters passed by the editor.
   * @returns {object} Sanitized parameters.
   */
  sanitizeParams(authorParams) {
    const defaults = Util.extend({}, getSemanticsDefaults());
    const params = Util.extend(defaults, authorParams);

    if (params.behaviour.sizing === 'grow') {
      delete params.behaviour.fixedHeight;
    }
    if (params.behaviour.sizing === 'fixed') {
      delete params.behaviour.maxHeight;
    }
    if (params.behaviour.maxHeight === '0') {
      delete params.behaviour.maxHeight;
    }

    if (params.behaviour.startBehavior === 'manually') {
      params.behaviour.showNavigationBar = true;
    }

    params.messages = params.messages
      .filter((message) => (typeof message === 'object' && message !== null))
      .map((message) => {
        // Sanitize message text
        if (typeof message.text !== 'string' || message.text.trim() === '') {
          message.text = this.dictionary.get('l10n.emptyMessage');
        }

        // Sanitize message overrides
        if (typeof message.overrides !== 'object' || message.overrides === null) {
          message.overrides = {};
        }
        message.overrides = Util.extend({ origin: 'auto' }, message.overrides);
        if (!['auto', 'left', 'right'].includes(message.overrides.origin)) {
          message.overrides.origin = 'auto';
        }

        return message;
      });

    return params;
  }

  /**
   * Add contrast colors to visuals.
   * @param {object} visualsOriginal Original visuals object.
   * @returns {object} Visuals with contrast colors added.
   */
  addContrastColors(visualsOriginal) {
    const visuals = { ...visualsOriginal };

    visuals.left.colorText = getDefaultContrastColor(visuals.left?.colorBackgroundDefault);
    visuals.right.colorText = getDefaultContrastColor(visuals.right?.colorBackgroundDefault);

    return visuals;
  }

  /**
   * Set message origins based on the previous message's origin.
   * @param {object[]} messages Messages.
   * @returns {object[]} Messages with auto origins replaced with left/right.
   */
  rearrangeMessageOrigins(messages) {
    return messages.map((messageOriginal, index) => {
      const message = { ...messageOriginal };

      if (message.overrides.origin !== 'auto') {
        return message;
      }

      if (index === 0) {
        message.overrides.origin = DEFAULT_START_ORIGIN;
      }
      else {
        const previousOrigin = messages[index - 1].overrides.origin;
        message.overrides.origin = previousOrigin === 'left' ? 'right' : 'left';
      }

      return message;
    });
  }

  /**
   * Set globals message values based on visuals.
   * @param {object[]} messages Messages.
   * @param {object} visuals Visuals object containing colors for origins.
   * @returns {object[]} Messages with background and text colors set.
   */
  setMessageGlobals(messages, visuals) {
    return messages.map((messageOriginal) => {
      const message = { ...messageOriginal };

      message.backgroundColor = message.backgroundColor ?? visuals[message.overrides.origin].colorBackgroundDefault;
      message.iconImage = message.iconImage ?? visuals[message.overrides.origin].iconImage;
      message.textColor = message.textColor ?? visuals[message.overrides.origin].colorText;
      message.userName = message.authorName ?? visuals[message.overrides.origin].userName;

      return message;
    });
  }

  /**
   * Append a message box indicating missing content.
   * @param {HTMLElement} wrapper Element to append the message box to.
   * @param {string} text Text to display in the message box.
   */
  appendMissingContentMessage(wrapper, text) {
    const messageBox = new MessageBox({ text: text });
    wrapper.append(messageBox.getDOM());
  }

  /**
   * Attach library to wrapper.
   * @param {H5P.jQuery} $wrapper Content's container.
   */
  attach($wrapper) {
    this.wrapper = $wrapper.get(0);
    this.wrapper.classList.add('h5p-chat-simulator');

    if (!document.body.contains(screenreaderDOM)) {
      document.body.append(screenreaderDOM);
    }

    if (this.params.messages.length === 0) {
      this.appendMissingContentMessage(this.wrapper, this.dictionary.get('l10n.noMessages'));
      return;
    }

    this.wrapper.append(this.main.getDOM());
  }

  /**
   * Reset the chat simulator.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
   */
  resetTask() {
    this.main.reset();
  }
}
