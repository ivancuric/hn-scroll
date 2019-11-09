import { html } from 'lighterhtml';
import './styles.scss';

const API_URL = 'https://hacker-news.firebaseio.com/v0';

export function rafPromise() {
  return new Promise(requestAnimationFrame);
}

interface story {
  by: string;
  descendants: number;
  id: number;
  score: number;
  time: number;
  title: string;
  type: 'story';
  url: string;
}

const DEFAULT_HEIGHT = 40;
const POST = 10;
const PRE = 3;

(async () => {
  let nextIndexToRender = 0;
  const processedIndexArray: number[] = [];
  let renderQueue: number[] = [];
  const list = document.querySelectorAll('.list')[0];
  const window = document.querySelectorAll('.window')[0];
  const h = window.getBoundingClientRect().height;
  const n = Math.round(h / DEFAULT_HEIGHT);

  const fetchStories = async () => {
    const response = await fetch(`${API_URL}/newstories.json`);
    const parsed = await response.json();
    return parsed;
  };

  const fetchItem = async (item: number, i: number) => {
    const response = await fetch(`${API_URL}/item/${item}.json`);
    const parsed = await response.json();
    batchItems(i);
    return parsed;
  };

  const batchItems = async (i: number) => {
    processedIndexArray.push(i);

    if (i > nextIndexToRender) {
      return;
    }

    const currentBatch: number[] = [];

    for (let j = nextIndexToRender; j < workingSubset.length; j++) {
      if (processedIndexArray.includes(j)) {
        currentBatch.push(j);
      } else {
        nextIndexToRender = j;
        break;
      }
    }

    // RENDER STUFF
    pushToRenderQueue(currentBatch);
  };

  const pushToRenderQueue = async (currentBatch: number[]) => {
    renderQueue.push(...currentBatch);
    const raf = await rafPromise();
    if (!renderQueue.length) {
      return;
    }
    console.log(renderQueue, raf);
    renderQueue = [];
  };

  // console.log(n);
  const stories: number[] = await fetchStories();

  const workingSubset = stories.slice(0, 20);

  const promiseArray = await Promise.all(
    workingSubset.map((id: number, i) => fetchItem(id, i)),
  );

  // const items: story[] = await Promise.all(promiseArray.filter(Boolean));

  // items.forEach(item =>
  //   list.appendChild(
  //     html`
  //       <div class="list-item">${item.title}</div>
  //     `,
  //   ),
  // );
})();
