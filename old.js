
// Web Components: Extending Native Elements, A working example

import CustomVideoElement from 'custom-video-element';
import Hls from 'hls.js';

class HLSVideoElement extends CustomVideoElement {
  constructor() {
    super();
  }

  get src() {
    // Use the attribute value as the source of truth.
    // No need to store it in two places.
    // This avoids needing a to read the attribute initially and update the src.
    return this.getAttribute('src');
  }

  set src(val) {
    // If being set by attributeChangedCallback,
    // dont' cause an infinite loop
    if (val !== this.src) {
      this.setAttribute('src', val);
    }
  }

  load() {
    if (Hls.isSupported()) {
      const hlsConfig = {
        debug: true,
        autoStartLoad: false
      }

      // We attach hls to this to use it externally
      this.hls = new Hls(hlsConfig);

      // We first attachMedia to the native video element
      // https://github.com/video-dev/hls.js/blob/master/docs/API.md#third-step-load-a-manifest
      // this.hls.attachMedia(this.nativeEl);

      // // Then we loadSource when MEDIA_ATTACHED event is fired
      // this.hls.on(Hls.Events.MEDIA_ATTACHED, () => this.hls.loadSource(this.src));

      // // We manage errors because it could happen under certains conditions
      // // https://github.com/video-dev/hls.js/blob/master/docs/API.md#fifth-step-error-handling
      // this.hls.on(Hls.Events.ERROR, (event, data) => {
      //   if (data.fatal) {
      //     switch (data.type) {
      //       case Hls.ErrorTypes.NETWORK_ERROR:
      //         console.log('fatal network error encountered, try to recover');
      //         this.hls.startLoad();
      //         break;
      //       case Hls.ErrorTypes.MEDIA_ERROR:
      //         console.log('fatal media error encountered, try to recover');
      //         this.hls.recoverMediaError();
      //         break;
      //       default:
      //         // cannot recover
      //         this.hls.destroy();
      //         break;
      //     }
      //   }
      // });
      this.hls.loadSource(this.src);
      this.hls.attachMedia(this.nativeEl);
    } else if (this.nativeEl.canPlayType('application/vnd.apple.mpegurl')) {
      this.nativeEl.src = this.src;
    }
  }

  // play() {
  //   if (this.readyState === 0 && this.networkState < 2) {
  //     this.load();
  //     this.hls.on(Hls.Events.MANIFEST_PARSED,function() {
  //     video.play();
  //
  //     return this.nativeEl.play();
  //   }
  // }

  connectedCallback() {
    this.load();

    // Not preloading might require faking the play() promise
    // so that you can call play(), call load() within that
    // But wait until MANIFEST_PARSED to actually call play()
    // on the nativeEl.
    // if (this.preload === 'auto') {
    //   this.load();
    // }
  }

  // We destroy the hls if we use it
  disconnectedCallback() {
    if (this.hls) {
      this.hls.destroy()
    }
  }
}

if (!window.customElements.get('hls-video')) {
  window.customElements.define('hls-video', HLSVideoElement);
  window.HLSVideoElement = HLSVideoElement;
}

export default HLSVideoElement;