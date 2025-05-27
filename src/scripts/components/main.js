import ChatPanels from '@components/chat-panels/chat-panels.js';
import NavigationBar from '@components/navigation-bar/navigation-bar.js';
import Util from '@services/util.js';
import './main.scss';

/**
 * Main DOM component
 */
export default class Main {
  /**
   * @class
   * @param {object} [params] Parameters.
   */
  constructor(params = {}) {
    this.params = Util.extend({
      behavior: {},
      messages: []
    }, params);

    this.instantiateChatPanels();
    this.instantiateNavigationBar();

    this.dom = this.buildDOM();

    if (this.params.behavior.startBehavior === 'onceVisible') {
      this.toggleAutoplay();
    }
  }

  /**
   * Instantiate chat panels based on the messages provided in params.
   */
  instantiateChatPanels() {
    this.chatPanels = new ChatPanels(
      {
        messages: this.params.messages,
        behavior: this.params.behavior,
        dictionary: this.params.dictionary,
        globals: this.params.globals
      },
      {
        onEnded: () => {
          this.navigationBar.disableButton('forward-step');
          this.navigationBar.toggleButtonState('autoplay', false);
          this.navigationBar.disableButton('autoplay');
        }
      }
    );
  }

  /**
   * Instantiate the navigation bar with buttons for controlling the chat simulator.
   */
  instantiateNavigationBar() {
    const navigationBarButtons = [
      {
        id: 'forward-step',
        type: 'pulse',
        pulseStates: [
          {
            id: 'step',
            label: this.params.dictionary.get('a11y.stepButtonLabel'),
          }
        ],
        a11y: {
          disabled: this.params.dictionary.get('a11y.stepButtonDisabled')
        },
        onClick: () => {
          this.chatPanels.step();
        }
      },
      {
        id: 'autoplay',
        active: this.params.behavior.startBehavior === 'onceVisible',
        type: 'toggle',
        a11y: {
          active: this.params.dictionary.get('a11y.autoplayButtonActive'),
          inactive: this.params.dictionary.get('a11y.autoplayButtonInactive'),
          disabled: this.params.dictionary.get('a11y.autoplayButtonDisabled')
        },
        onClick: () => {
          this.toggleAutoplay();
        }
      },
      {
        id: 'reset',
        type: 'pulse',
        pulseStates: [
          {
            id: 'reset',
            label: this.params.dictionary.get('a11y.resetButtonLabel'),
          }
        ],
        onClick: () => {
          this.reset();
        }
      }
    ];

    this.navigationBar = new NavigationBar({
      buttons: navigationBarButtons,
      dictionary: this.params.dictionary,
      hide: !this.params.behavior.showPlayerBar
    });
  }

  /**
   * Build the main DOM structure.
   * @returns {HTMLElement} The main DOM element.
   */
  buildDOM() {
    const dom = document.createElement('div');
    dom.classList.add('h5p-chat-simulator-main');

    dom.append(this.chatPanels.getDOM());
    dom.append(this.navigationBar.getDOM());

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
   * Toggle autoplaying chat panels.
   */
  toggleAutoplay() {
    this.chatPanels.toggleAutoplay();
  }

  /**
   * Reset the chat panels.
   */
  reset() {
    this.chatPanels.reset();

    this.navigationBar.enableButton('forward-step');
    this.navigationBar.enableButton('autoplay');
    this.navigationBar.reset();

    if (this.params.behavior.startBehavior === 'onceVisible') {
      this.toggleAutoplay();
    }
  }
}
