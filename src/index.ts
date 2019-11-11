import { Story } from './types';

(async () => {
  const API_URL = 'https://hacker-news.firebaseio.com/v0';
  const STORIES_TO_FETCH = 20;
  const DEBUG_BATCHES = false; // set to true to see batches

  let firstIndexToRender = 0;
  let lastIndexToRender = -1; // compensate for first iteration cycle

  let screenFull = false; // false if it can be filled with more items

  const processedIndexes = new Set<number>();
  const workingIndexes = new Set<number>();
  const processedStories: Story[] = [];
  const renderQueue: number[] = [];

  const list = document.getElementById('list');
  const sentinel = document.getElementById('sentinel');

  const observer = new IntersectionObserver(entries => {
    const entry = entries[0];

    screenFull = !entry.isIntersecting;
    if (entry.isIntersecting) {
      fetchNextBatch();
    }
  });

  // fetches an array of new stories. called once on app load
  const fetchAllNewStories = async () => {
    const response = await fetch(`${API_URL}/newstories.json`);
    const parsed: Promise<number[]> = await response.json();
    return parsed;
  };

  // fetches a single story
  const fetchStory = async (item: number) => {
    const response = await fetch(`${API_URL}/item/${item}.json`);
    const parsed: Promise<Story> = await response.json();
    return parsed;
  };

  const fetchNextBatch = () => {
    // return if there are any in the workingIndexSet + make TS happy
    if (workingIndexes.size || !newStoryIDs) {
      return;
    }

    lastIndexToRender += STORIES_TO_FETCH;

    if (lastIndexToRender >= newStoryIDs.length) {
      lastIndexToRender = newStoryIDs.length - 1;
    }

    // add n=STORIES_TO_FETCH indexes to the working set
    for (let i = firstIndexToRender; i <= lastIndexToRender; i++) {
      workingIndexes.add(i);
    }

    // add them to the processed stories array
    workingIndexes.forEach(async storyIndex => {
      const story = await fetchStory(newStoryIDs[storyIndex]).catch(() =>
        console.error(`Error fetching story ${newStoryIDs[storyIndex]}`),
      );

      if (!story) {
        return;
      }
      processedStories[storyIndex] = story;
      // when it's done fetching, add to the pipeline
      addToBatchPipeline(storyIndex);
    });
  };

  // batch by network response, sort and push to render queue
  const addToBatchPipeline = (index: number) => {
    const currentBatch: number[] = [];

    processedIndexes.add(index);

    let i = firstIndexToRender;

    for (; i <= lastIndexToRender; i++) {
      if (processedIndexes.has(i)) {
        currentBatch.push(i);
        workingIndexes.delete(i);
      } else {
        break;
      }
    }

    firstIndexToRender = i;

    if (currentBatch.length) {
      pushToRenderQueue(currentBatch);
    }
  };

  // batch by frames and render
  const pushToRenderQueue = async (currentBatch: number[]) => {
    renderQueue.push(...currentBatch);
    await new Promise(requestAnimationFrame);

    if (renderQueue.length === 0) {
      return;
    }

    await render();

    if (!screenFull) {
      fetchNextBatch();
    }
  };

  // batch by DOM nodes and append to DOM
  const render = async () => {
    const fragment = new DocumentFragment();

    if (DEBUG_BATCHES) {
      fragment.append(
        document.createRange().createContextualFragment('---------'),
      );
    }

    renderQueue.forEach(index => {
      const item: Story = processedStories[index];
      const x = document.createRange().createContextualFragment(
        `<li class="list-item">
            <div class="count">${index + 1}.</div>
            ${item.title}
          </li>`,
      );

      fragment.append(x);
    });

    list.append(fragment);

    renderQueue.length = 0;

    return true;
  };

  // START
  const newStoryIDs = await fetchAllNewStories().catch(() => {
    console.error('error in fetching posts');
  });

  if (newStoryIDs) {
    observer.observe(sentinel);
  }
})();
