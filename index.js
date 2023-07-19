import { CustomVideoElement } from 'custom-media-element';
import Hls from 'hls.js';

class HLSVideoElement extends CustomVideoElement {

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName !== 'src') {
      super.attributeChangedCallback(attrName, oldValue, newValue);
    }

    if (attrName === 'src' && oldValue != newValue) {
      this.load();
    }
  }

  #destroy() {
    if (this.api) {
      this.api.detachMedia();
      this.api.destroy();
      this.api = null;
    }
  }

  load() {
    this.#destroy();

    if (!this.src) {
      return;
    }

    if (Hls.isSupported()) {

      this.api = new Hls({
        // Mimic the media element with an Infinity duration for live streams.
        liveDurationInfinity: true
      });

      this.api.loadSource(this.src);
      this.api.attachMedia(this.nativeEl);

    } else if (this.nativeEl.canPlayType('application/vnd.apple.mpegurl')) {

      this.nativeEl.src = this.src;
    }
  }
}

if (globalThis.customElements && !globalThis.customElements.get('hls-video')) {
  globalThis.customElements.define('hls-video', HLSVideoElement);
}

export default HLSVideoElement;
