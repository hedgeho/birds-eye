# Bird's-Eye

### Situation

Core usecases:
- project management
- content visualizations
- workshops and asynchronous collaboration

Users frequently encounter large Miro boards that are either poorly organized or too complex to be quickly comprehensible.

### Problem

- Large Miro boards can be overwhelming, cluttered, and challenging to navigate efficiently.
- Irrelevant content can distract users from their current tasks.
- Presentations often lack a clear structure and guidance, making it difficult for viewers to focus on specific areas.

### Solution

Our proposed solution addresses these challenges by introducing "regions" that intelligently hide content when not in focus, providing users with a more streamlined and organized experience. 
The regions not only conceal items but also display a summary or title for the covered content, enhancing user understanding.

Implemented Functionality:

- #### region Creation:
  Users can create a "region" from a selection of items by using a custom action. An AI-generated title will be suggested to enhance user experience.

- #### Adding regions to Frames:
  regions can be seamlessly added to existing frames, ensuring flexibility in organizing and presenting information.

- #### Dynamic Visibility:
  regions intelligently hide when a user is zoomed in on the covered items, allowing for a detailed examination.
  regions become visible when a user is at a distance or outside the current view scope, providing context and structure.

By implementing this solution, we aim to simplify the navigation of large Miro boards, reduce distractions, and enhance the overall user experience by introducing an intelligent region system that adapts to user interactions.

### Experimental features

Custom actions

### How to start locally

- Add a `.env` file containing an `VITE_OPENAI_API_KEY` that refers to a key for an azure openai service.
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
