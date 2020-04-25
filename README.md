# Hacker News List Viewer

## Usage:

To install (feel free to use `npm`):

```sh
yarn install
yarn start
```

If you want to run the app in production mode use `yarn build` to build the production bundle and `npx serve dist` (or some other HTTP server) to serve the `dist` directory locally. The app can also be quickly edited on https://githubbox.com/ivancuric/hn-scroll.

## Config

You can set `DEBUG_BATCHES = true` to see the batched updates visually in the DOM. `STORIES_UNDER_FOLD` controls the stories fetched outside the viewport. You can uncomment the background of the `#sentinel` in styles.scss to see the behaviour of the `intersectionObserver`.

## Choice of tools and technology

The app was built in [CodeSandbox](https://codesandbox.io/s/github/ivancuric/hn-scroll) and then finished up locally to get the service worker up and running. The repo is available on [https://github.com/ivancuric/hn-scroll](https://github.com/ivancuric/hn-scroll).

Taking into account the requirements and the evaluation criteria for the task I've decided to avoid using a JS framework and have written it in "vanilla" TypeScript.

The app is written in a way to minimize re-rendering and to display content as soon as possible without the need to reorder it. The responses are batched by network responses, animation frames and finally batched into a single DOM update.

I've also written it as an IIFE instead of a `class` to make it more readable with less `this.x` going around.

The app is using [Workbox](https://developers.google.com/web/tools/workbox) and service workers to cache responses and provide offline functionality.

The app has zero dependencies (without the service worker) and is under 2KB before gzipping, a lot of it being [Parcel](https://parceljs.org/)'s module loader. It also scores 100 on Lighthouse.

## Thoughts and potential for upgrades

Since most of the logic is fetching data and batching network responses, it's easy to move to a JS framework like React.

The same data fetching could be done in a service worker, but since the JS thread is doing very little work it would be overkill.

I've thought about implementing a DOM node recycler, but there is no need in this case, since the entire DOM is taking a minimal amount of memory. In case one was needed a premade solution like [react-window](https://github.com/bvaughn/react-window) could be used.

The app is built as a single component with an internal state and methods. The current implementation pipeline is built as a chain of side-effects working on the internal state:  
`fetchNextBatch => addToBatchPipeline => pushToRenderQueue => render => fetchNextBatch (optional)`

Most of this could be decoupled but would add a lot of additional complexity.

The design is very rudimentary (true to the original 😅). I didn't want to spend a lot of time desiging as it's not a part of the evaluation criteria, so I went with a GitHub markdown-like look.

The UX is also a bit rough since there are no helpful error messages or loading indicators presented to the user. This is the area where most work could be done.

The scrolling could be made non-blocking by using tombstones/placeholders. This would also allow for viewport-dependent fetching in batches and non-sequential fetches. This would also require compensation for viewport shifting, ideally using [FLIP](https://aerotwist.com/blog/flip-your-animations/).

Aditionally, the fetching/rendering could potentially be a bit faster by listening to `scroll` events instead of `intersectionObserver`. Even though `scroll` events are passive, `intersectionObserver` uses `requestIdleCallback` under the hood, meaning that it's throttled down even more. This approach would also require additional work, like reacting to `resize` events.
