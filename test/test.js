import { fixture, assert, aTimeout } from '@open-wc/testing';
import '../dist/hls-video-element.js';

describe('<hls-video>', () => {
  it('has a video like API', async function () {
    this.timeout(10000);

    const player = await fixture(`<hls-video
      src="https://stream.mux.com/r4rOE02cc95tbe3I00302nlrHfT023Q3IedFJW029w018KxZA.m3u8"
      muted
    ></hls-video>`);

    assert.equal(player.paused, true, 'is paused on initialization');

    assert.equal(player.paused, true, 'is paused on initialization');
    assert(!player.ended, 'is not ended');

    // player.muted = true;
    // await aTimeout(50); // postMessage is not instant
    assert(player.muted, 'is muted');

    assert.equal(player.volume, 1, 'is all turned up');
    player.volume = 0.5;
    await aTimeout(100); // postMessage is not instant
    assert.equal(player.volume, 0.5, 'is half volume');

    assert(!player.loop, 'loop is false by default');
    player.loop = true;
    assert(player.loop, 'loop is true');

    if (player.duration == null || Number.isNaN(player.duration)) {
      await promisify(player.addEventListener.bind(player))('durationchange');
    }

    assert.equal(Math.round(player.duration), 115, `is 115s long`);

    player.src = 'https://stream.mux.com/1EFcsL5JET00t00mBv01t00xt00T4QeNQtsXx2cKY6DLd7RM.m3u8';

    if (player.duration == null || Number.isNaN(player.duration)) {
      await promisify(player.addEventListener.bind(player))('durationchange');
    }

    assert.equal(Math.round(player.duration), 20, `is 20s long`);

    player.src = 'https://stream.mux.com/r4rOE02cc95tbe3I00302nlrHfT023Q3IedFJW029w018KxZA.m3u8';

    if (player.duration == null || Number.isNaN(player.duration)) {
      await promisify(player.addEventListener.bind(player))('durationchange');
    }

    assert.equal(Math.round(player.duration), 115, `is 115s long`);

    player.muted = true;

    try {
      await player.play();
    } catch (error) {
      console.warn(error);
    }
    assert(!player.paused, 'is playing after player.play()');

    await aTimeout(1000);

    assert.equal(String(Math.round(player.currentTime)), 1, 'is about 1s in');

    player.playbackRate = 2;
    await aTimeout(1000);

    assert.equal(String(Math.round(player.currentTime)), 3, 'is about 3s in');
  });
});

export function promisify(fn) {
  return (...args) =>
    new Promise((resolve) => {
      fn(...args, (...res) => {
        if (res.length > 1) resolve(res);
        else resolve(res[0]);
      });
    });
}
