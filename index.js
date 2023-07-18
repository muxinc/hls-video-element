import { CustomVideoElement } from 'custom-media-element';
import Hls from 'hls.js';

class HLSVideoElement extends CustomVideoElement {
  constructor() {
    super();
  }

  get src() {
    return super.src;
  }

  set src(src) {
    super.src = src;
    if (this.#hlsPlayer) this.#hlsPlayer.loadSource(this.src);
  }

  #hlsPlayer = null;

  load() {
    if (Hls.isSupported()) {
      this.#hlsPlayer = new Hls({
        // Mimic the media element with an Infinity duration
        // for live streams
        liveDurationInfinity: true,
      });

      this.#hlsPlayer.loadSource(this.src);
      this.#hlsPlayer.attachMedia(this.nativeEl);
    } else if (this.nativeEl.canPlayType('application/vnd.apple.mpegurl')) {
      this.nativeEl.src = this.src;
    }
  }

  connectedCallback() {
    this.load();
  }
}

if (globalThis.customElements && !globalThis.customElements.get('hls-video')) {
  globalThis.customElements.define('hls-video', HLSVideoElement);
}

export default HLSVideoElement;
