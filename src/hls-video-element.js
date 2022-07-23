import { SuperVideoElement } from 'super-media-element';
import Hls from 'hls.js';

class HlsVideoElement extends SuperVideoElement {
  async attributeChangedCallback(attrName, oldValue, newValue) {
    switch (attrName) {
      case 'src': {
        this.load();
        return;
      }
    }

    super.attributeChangedCallback(attrName, oldValue, newValue);
  }

  disconnectedCallback() {
    this.#destroy();
  }

  #destroy() {
    if (this.api) {
      this.api.detachMedia();
      this.api.destroy();
      this.api = null;
    }
  }

  get src() {
    return this.getAttribute('src');
  }

  set src(val) {
    if (val == this.src) return;
    this.setAttribute('src', val);
  }

  async load() {
    this.#destroy();

    // Wait 1 tick to allow other attributes to be set.
    await Promise.resolve();

    if (!this.src) {
      return;
    }

    if (Hls.isSupported()) {
      this.api = new Hls();

      switch (this.nativeEl.preload) {
        case 'none': {
          // when preload is none, load the source on first play
          const loadSourceOnPlay = () => this.api.loadSource(this.src);
          this.nativeEl.addEventListener('play', loadSourceOnPlay, {
            once: true,
          });
          this.api.on(Hls.Events.DESTROYING, () => {
            this.nativeEl.removeEventListener('play', loadSourceOnPlay);
          });
          break;
        }
        case 'metadata': {
          const originalLength = this.api.config.maxBufferLength;
          const originalSize = this.api.config.maxBufferSize;
          // load the least amount of data possible
          this.api.config.maxBufferLength = 1;
          this.api.config.maxBufferSize = 1;
          // and once a user has player, allow for it to load data as normal
          const increaseBufferOnPlay = () => {
            this.api.config.maxBufferLength = originalLength;
            this.api.config.maxBufferSize = originalSize;
          };
          this.nativeEl.addEventListener('play', increaseBufferOnPlay, {
            once: true,
          });
          this.api.on(Hls.Events.DESTROYING, () => {
            this.nativeEl.removeEventListener('play', increaseBufferOnPlay);
          });
          this.api.loadSource(this.src);
          break;
        }
        default:
          // load source immediately for any other preload value
          this.api.loadSource(this.src);
      }

      this.api.attachMedia(this.nativeEl);
    } else if (this.nativeEl.canPlayType('application/vnd.apple.mpegurl')) {
      this.nativeEl.src = this.src;
    }
  }
}

if (!globalThis.customElements.get('hls-video')) {
  globalThis.customElements.define('hls-video', HlsVideoElement);
  globalThis.HlsVideoElement = HlsVideoElement;
}

export default HlsVideoElement;
