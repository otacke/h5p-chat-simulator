import ToolbarButton from './toolbar-button.js';
import './navigation-bar.scss';

export default class NavigationBar {

  constructor(params = {}) {
    this.params = params;

    this.buttons = {};

    this.dom = this.buildDOM();

    this.initializeButtonTabOrder();
  }

  /**
   * Initialize button tab order.
   */
  initializeButtonTabOrder() {
    this.currentButtonIndex = 0;
    Object.values(this.buttons).forEach((button, index) => {
      button.setAttribute('tabindex', index === this.currentButtonIndex ? '0' : '-1');
    });
  }

  /**
   * Build the DOM for the navigation bar.
   * @returns {HTMLElement} The DOM element for the navigation bar.
   */
  buildDOM() {
    const dom = document.createElement('div');
    dom.classList.add('h5p-chat-simulator-navigation-bar');
    dom.setAttribute('role', 'toolbar');

    if (this.params.hide) {
      dom.classList.add('display-none');
    }

    dom.addEventListener('keydown', (event) => {
      this.handleKeydown(event);
    });

    this.buttonsContainer = document.createElement('div');
    this.buttonsContainer.classList.add('toolbar-buttons');

    this.params.buttons.forEach((button) => {
      this.addButton(button);
    });

    dom.appendChild(this.buttonsContainer);

    return dom;
  }

  /**
   * Handle key down.
   * @param {KeyboardEvent} event Keyboard event.
   */
  handleKeydown(event) {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowUp') {
      this.moveButtonFocus(-1);
    }
    else if (event.code === 'ArrowRight' || event.code === 'ArrowDown') {
      this.moveButtonFocus(1);
    }
    else if (event.code === 'Home') {
      this.moveButtonFocus(0 - this.currentButtonIndex);
    }
    else if (event.code === 'End') {
      this.moveButtonFocus(
        Object.keys(this.buttons).length - 1 - this.currentButtonIndex,
      );
    }
    else {
      return;
    }
    event.preventDefault();
  }

  /**
   * Move button focus.
   * @param {number} offset Offset to move position by.
   */
  moveButtonFocus(offset) {
    if (typeof offset !== 'number') {
      return;
    }
    if (
      this.currentButtonIndex + offset < 0 ||
      this.currentButtonIndex + offset > Object.keys(this.buttons).length - 1
    ) {
      return; // Don't cycle
    }
    Object.values(this.buttons)[this.currentButtonIndex].setAttribute('tabindex', '-1');
    this.currentButtonIndex = this.currentButtonIndex + offset;
    const focusButton = Object.values(this.buttons)[this.currentButtonIndex];
    focusButton.setAttribute('tabindex', '0');
    focusButton.focus();
  }

  /**
   * Add button.
   * @param {object} [button] Button parameters.
   */
  addButton(button = {}) {
    if (typeof button.id !== 'string') {
      return; // We need an id at least
    }

    this.buttons[button.id] = new ToolbarButton(
      {
        id: button.id,
        ...(button.a11y && { a11y: button.a11y }),
        classes: ['toolbar-button', `toolbar-button-${button.id}`],
        ...(typeof button.disabled === 'boolean' && {
          disabled: button.disabled,
        }),
        ...(button.active && { active: button.active }),
        ...(button.type && { type: button.type }),
        ...(button.pulseStates && { pulseStates: button.pulseStates }),
        ...(button.pulseIndex && { pulseIndex: button.pulseIndex }),
      },
      {
        ...(typeof button.onClick === 'function' && {
          onClick: (event, params) => {
            button.onClick(event, params);
          },
        }),
      },
    );
    this.buttonsContainer.appendChild(this.buttons[button.id].getDOM());
  }

  /**
   * Get the DOM element of the navigation bar.
   * @returns {HTMLElement} The DOM element.
   */
  getDOM() {
    return this.dom;
  }

  /**
   * Enable button.
   * @param {string} id Button id.
   */
  enableButton(id = '') {
    if (!this.buttons[id]) {
      return; // Button not available
    }

    this.buttons[id].enable();
  }

  /**
   * Disable button.
   * @param {string} id Button id.
   */
  disableButton(id = '') {
    if (!this.buttons[id]) {
      return; // Button not available
    }

    this.buttons[id].disable();
  }

  /**
   * Toggle button state.
   * @param {string} id Button id.
   * @param {boolean} state State to set the button to, if not provided, toggles the current state.
   */
  toggleButtonState(id = '', state) {
    if (!this.buttons[id]) {
      return; // Button not available
    }

    state = (typeof state === 'boolean') ? state : !this.buttons[id].isActive();

    this.buttons[id].force(state, { noCallback: true });
  }

  /**
   * Reset.
   */
  reset() {
    this.params.buttons.forEach((button) => {
      this.buttons[button.id].force(button.active ?? false, { noCallback: true } );
    });
  }
}
