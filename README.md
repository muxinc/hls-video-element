# `<hls-video>`

A custom element (web component) for playing HTTP Live Streaming (HLS) videos.

The element API matches the HTML5 `<video>` tag, so it can be easily swapped with other media, and be compatible with other UI components that work with the video tag.

## Example

```html
<html>
<head>
  <script type="module" src="https://unpkg.com/hls-video-element@0.0"></script>
</head>
<body>

  <hls-video controls src="https://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe.m3u8"></hls-video>

</body>
</html>
```

## Installing

`<hls-video>` is packaged as a javascript module (es6) only, which is supported by all evergreen browsers and Node v12+.

### Loading into your HTML using `<script>`

Note the `type="module"`, that's important.

> Modules are always loaded asynchronously by the browser, so it's ok to load them in the head :thumbsup:, and best for registering web components quickly.

```html
<head>
  <script type="module" src="https://unpkg.com/hls-video-element@0.0"></script>
</head>
```

### Adding to your app via `npm`

```bash
npm install hls-video-element --save
```
Or yarn
```bash
yarn add hls-video-element
```

Include in your app javascript (e.g. src/App.js)
```js
import 'hls-video-element';
```
This will register the custom elements with the browser so they can be used as HTML.
