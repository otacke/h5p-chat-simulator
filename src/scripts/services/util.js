/** Class for utility functions */
export default class Util {
  /**
   * Extend an array just like JQuery's extend.
   * @returns {object} Merged objects.
   */
  static extend() {
    for (let i = 1; i < arguments.length; i++) {
      for (let key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          if (
            typeof arguments[0][key] === 'object' &&
            typeof arguments[i][key] === 'object'
          ) {
            this.extend(arguments[0][key], arguments[i][key]);
          }
          else {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
    }
    return arguments[0];
  }

  /**
   * Call callback function once dom element gets visible in viewport.
   * @async
   * @param {HTMLElement} dom DOM element to wait for.
   * @param {function} callback Function to call once DOM element is visible.
   * @param {object} [options] IntersectionObserver options.
   * @returns {IntersectionObserver} Promise for IntersectionObserver.
   */
  static async callOnceVisible(dom, callback, options = {}) {
    if (typeof dom !== 'object' || typeof callback !== 'function') {
      return; // Invalid arguments
    }

    options.threshold = options.threshold || 0;

    return await new Promise((resolve) => {
      // iOS is behind ... Again ...
      const idleCallback = window.requestIdleCallback ?
        window.requestIdleCallback :
        window.requestAnimationFrame;

      idleCallback(() => {
        // Get started once visible and ready
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            observer.unobserve(dom);
            observer.disconnect();

            callback();
          }
        }, {
          ...(options.root && { root: options.root }),
          threshold: options.threshold,
        });
        observer.observe(dom);

        resolve(observer);
      });
    });
  }
}
