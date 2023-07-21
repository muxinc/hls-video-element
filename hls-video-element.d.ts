import { CustomVideoElement } from 'custom-media-element';
import Hls from 'hls.js';

declare class HLSVideoElement extends CustomVideoElement {
  /**
   * The current instance of the HLS.js library.
   *
   * @example
   * ```js
   * const video = document.querySelector('hls-video');
   * video.api.on(Hls.Events.MANIFEST_PARSED, () => {});
   * ```
   */
  api: Hls | null;

  /**
   * Fires when attributes are changed on the custom element.
   */
  attributeChangedCallback(attrName: string, oldValue: any, newValue: any): void;

  /**
   * Loads the HLS.js instance and attach it to the video element.
   */
  load(): Promise<void>;

  /**
   * Unloads the HLS.js instance and detaches it from the video element.
   */
  #destroy(): void;
}

export default HLSVideoElement;

export { Hls };
