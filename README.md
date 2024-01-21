# Bird's-Eye

## Situation

Users often encounter large boards that may be poorly organized or to complex to comprehend quickly. 

## Problem

- Large miro board feel overwhelming, cluttered and hard to navigate.
- Content that is irrelevant at a given moment distracts from the current task.
- Presentations may lack structure and guidance for the viewers on where to concentrate

## Solution

Our solution is to create "curtains" that hide the contents underneath, when the user's focus is not inside the area.
When the user is looking at the contents the "curtain" hides and becomes a simple frame.

Implemented functionality:
- Creation of a "curtain" from a selection of items. In this case an AI-generated title will be offered.
- Adding a "curtain" to an existing frame.
- Hiding a "curtain" when a user is zoomed in the covered items.
- Showing a "curtain" when a user is far or outside of view scope.

## Experimental features used

Custom actions, ...

### How to start locally

- Run `npm i` to install dependencies.
- Run `npm start` to start developing. \
  Your URL should be similar to this example:
 ```
 http://localhost:3000
 ```
- Paste the URL under **App URL** in your
  [app settings](https://developers.miro.com/docs/build-your-first-hello-world-app#step-3-configure-your-app-in-miro).
- Open a board; you should see your app in the app toolbar or in the **Apps**
  panel.

### How to build the app

- Run `npm run build`. \
  This generates a static output inside [`dist/`](./dist), which you can host on a static hosting
  service.

This app uses [Vite](https://vitejs.dev/). \
If you want to modify the `vite.config.js` configuration, see the [Vite documentation](https://vitejs.dev/guide/).
