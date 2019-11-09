import { html } from 'lighterhtml';
import onChange from 'on-change';
import './styles.scss';

const API_URL = 'https://hacker-news.firebaseio.com/v0';

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
let currentIndex = 0;

(async () => {
  const list = document.querySelectorAll('.list')[0];
  const window = document.querySelectorAll('.window')[0];
  const h = window.getBoundingClientRect().height;
  const n = Math.round(h / DEFAULT_HEIGHT);

  // console.log(n);
  const stories: number[] = await (await fetch(
    `${API_URL}/newstories.json`,
  )).json();

  const subset = stories.slice(currentIndex, n + POST);

  const promiseArray = await Promise.all(
    subset.map((item: number) => fetch(`${API_URL}/item/${item}.json`)),
  );

  console.log(promiseArray);

  const watchedArray = onChange(promiseArray, (path, value) => {
    console.log(path, value);
  });

  const items: story[] = await Promise.all(
    promiseArray.map(x => x.json()),
  ).then(x => x.filter(Boolean));

  items.forEach(item =>
    list.appendChild(
      html`
        <div class="list-item">${item.title}</div>
      `,
    ),
  );
})();
