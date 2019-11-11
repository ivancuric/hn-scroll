# Hacker News List Viewer

## Usage:

To install (feel free to use `npm`):

```sh
yarn install
yarn start
```

If you want to run the app in production mode use `yarn build` to build the production bundle and `npx serve dist` (or some other HTTP server) to serve the `dist` directory locally.

## Choice of tools and technology

The app was built in [CodeSandbox](https://codesandbox.io/s/github/ivancuric/hn-scroll) and then finished up locally to get the service worker up and running.

Taking into account the requirements and the evaluation criteria for the task I've decided to avoid using a JS framework and have written it in "vanilla" TypeScript.

The app is written in a way to minimize re-rendering and to display content as soon as possible without the need to reorder it. The responses are batched by network and frames.

Since the app is quite simple, I thought that it's easier to write the app logic in a single file while also being more readable.

I've also written it as an async IIFE instead of a `class` to make it more readable with less `this.x` going around.

In case the app functionality needs to be expanded it's easy to extract the functionality into separate files and/or modules.

The app is using [Workbox](https://developers.google.com/web/tools/workbox) and service workers to cache responses and provide offline functionality.

The app has zero dependencies (without the service worker) and is under 1KB before gzipping.

## Thoughts and potential for upgrades

Since most of the logic is fetching data and batching network responses, it's easy to move to a JS framework like React.

The same data fetching could be done in a service worker, but since the JS thread is doing very little work it would be overkill.

I've thought about implementing a DOM node recycler, but there is no need in this case, since the entire DOM is taking a minimal amount of memory. In case one was needed it would probably use a premade solution like [react-window](https://github.com/bvaughn/react-window)

The design is very rudimentary (true to the original 😅). I didn't want to spend a lot of time desiging as it's not a part of the evaluation criteria, so I went with a GitHub markdown-like look.

The UX is also a bit rough since there are no helpful error messages or loading indicators presented to the user. This is the area where most work could be done.
