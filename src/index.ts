import { Story } from './types';
import { fetchStory, fetchAllNewStories } from './api';
import { listItem } from './listItem';

// CONFIG
const STORIES_UNDER_FOLD = 20;
const DEBUG_BATCHES = false; // set to true to see batches

(() => {
  // LOCAL STATE
  let firstIndexToRender = 0;
  let lastIndexToRender = -1; // compensate for first iteration cycle

  let shouldFetchMoreItems = false; // false if it can be filled with more items

  const newStoryIDs: number[] = [];
  const processedIndexes = new Set<number>();
  const workingIndexes = new Set<number>();
  const processedStories: (Story | void)[] = []; // possible malformed response
  const renderQueue: number[] = [];

  const list = document.getElementById('list');

  // METHODS
  const start = async () => {
    const stories = await fetchAllNewStories().catch(() => {
      console.error('error in fetching posts');
    });

    if (stories) {
      newStoryIDs.push(...stories);
      initObserver();
    }
  };

  const initObserver = () => {
    const observer = new IntersectionObserver(onIntersect);
    const sentinel = document.getElementById('sentinel');
    observer.observe(sentinel);
  };

  const onIntersect = (entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];

    shouldFetchMoreItems = entry.isIntersecting;

    fetchNextBatch();
  };

  const fetchNextBatch = () => {
    if (!shouldFetchMoreItems || workingIndexes.size || !newStoryIDs.length) {
      return;
    }

    lastIndexToRender += STORIES_UNDER_FOLD;

    // prevent overflow
    if (lastIndexToRender >= newStoryIDs.length) {
      lastIndexToRender = newStoryIDs.length - 1;
    }

    // add n=STORIES_TO_FETCH indexes to the working set
    for (let i = firstIndexToRender; i <= lastIndexToRender; i++) {
      workingIndexes.add(i);
    }

    // fetch each and add them to the processed stories array
    workingIndexes.forEach(async storyIndex => {
      const story = await fetchStory(newStoryIDs[storyIndex]).catch(() =>
        console.error(`Error fetching story ${newStoryIDs[storyIndex]}`),
      );

      processedStories[storyIndex] = story;
      // when each story is done fetching, add it to the pipeline
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

  // batch by frames and forward to render
  const pushToRenderQueue = async (currentBatch: number[]) => {
    renderQueue.push(...currentBatch);
    await new Promise(requestAnimationFrame);

    if (renderQueue.length === 0) {
      return;
    }

    await render();

    // required to fill the initial screen
    fetchNextBatch();
  };

  // batch by DOM nodes and append to DOM
  const render = async () => {
    const fragment = new DocumentFragment();

    if (DEBUG_BATCHES) {
      fragment.append(
        document.createRange().createContextualFragment('<hr />'),
      );
    }

    renderQueue.forEach(index => {
      const item = processedStories[index];
      item && fragment.append(listItem(index, item));
    });

    list.append(fragment);
    renderQueue.length = 0;

    return true;
  };

  // START
  start();
})();
