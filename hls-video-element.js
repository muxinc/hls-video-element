import { CustomVideoElement } from 'custom-media-element';
import { MediaTracksMixin } from 'media-tracks';
import Hls from 'hls.js/dist/hls.mjs';

class HLSVideoElement extends MediaTracksMixin(CustomVideoElement) {

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

  async load() {
    this.#destroy();

    if (!this.src) {
      return;
    }

    // Prefer using hls.js over native if it is supported.
    if (Hls.isSupported()) {

      this.api = new Hls({
        // Mimic the media element with an Infinity duration for live streams.
        liveDurationInfinity: true
      });

      // Wait 1 tick to allow other attributes to be set.
      await Promise.resolve();

      // Set up preload
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

      // Set up tracks & renditions

      // Create a map to save the unique id's we create for each level and rendition.
      // hls.js uses the levels array index primarily but we'll use the id to have a
      // 1 to 1 relation from rendition to level.
      const levelIdMap = new WeakMap();

      this.api.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        removeAllMediaTracks();

        const videoTrack = this.addVideoTrack('main');
        videoTrack.selected = true;

        for (const [id, level] of data.levels.entries()) {
          const videoRendition = videoTrack.addRendition(
            level.url[0],
            level.width,
            level.height,
            level.videoCodec,
            level.bitrate
          );

          // The returned levels all have an id of `0`, save the id in a WeakMap.
          levelIdMap.set(level, `${id}`);
          videoRendition.id = `${id}`;
        }

        for (let [id, a] of data.audioTracks.entries()) {
          // hls.js doesn't return a `kind` property for audio tracks yet.
          const kind = a.default ? 'main' : 'alternative';
          const audioTrack = this.addAudioTrack(kind, a.name, a.lang);
          audioTrack.id = `${id}`;

          if (a.default) {
            audioTrack.enabled = true;
          }
        }
      });

      this.audioTracks.addEventListener('change', () => {
        this.api.audioTrack = [...this.audioTracks].find(t => t.enabled).id;
      });

      // Fired when a level is removed after calling `removeLevel()`
      this.api.on(Hls.Events.LEVELS_UPDATED, (event, data) => {
        const videoTrack = this.videoTracks[this.videoTracks.selectedIndex ?? 0];
        if (!videoTrack) return;

        const levelIds = data.levels.map((l) => levelIdMap.get(l));

        for (const rendition of this.videoRenditions) {
          if (rendition.id && !levelIds.includes(rendition.id)) {
            videoTrack.removeRendition(rendition);
          }
        }
      });

      // hls.js doesn't support enabling multiple renditions.
      //
      // 1. if all renditions are enabled it's auto selection.
      // 2. if 1 of the renditions is disabled we assume a selection was made
      //    and lock it to the first rendition that is enabled.
      const switchRendition = ({ target: renditions }) => {
        const level = renditions.selectedIndex;
        if (level != this.api.nextLevel) {
          this.api.nextLevel = level;
        }
      };

      this.videoRenditions.addEventListener('change', switchRendition);

      const removeAllMediaTracks = () => {
        for (const videoTrack of this.videoTracks) {
          this.removeVideoTrack(videoTrack);
        }
        for (const audioTrack of this.audioTracks) {
          this.removeAudioTrack(audioTrack);
        }
      };

      this.api.once(Hls.Events.DESTROYING, removeAllMediaTracks);

      return;
    }

    // Wait 1 tick so this.nativeEl is sure to be defined.
    await Promise.resolve();

    // Use native HLS. e.g. iOS Safari.
    if (this.nativeEl.canPlayType('application/vnd.apple.mpegurl')) {

      this.nativeEl.src = this.src;
    }
  }
}

if (globalThis.customElements && !globalThis.customElements.get('hls-video')) {
  globalThis.customElements.define('hls-video', HLSVideoElement);
}

export default HLSVideoElement;

export { Hls };
