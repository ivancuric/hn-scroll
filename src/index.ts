import { html } from 'lighterhtml';

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

(async () => {
  const stories: number[] = await (await fetch(
    `${API_URL}/newstories.json`,
  )).json();

  const subset = stories.slice(0, 50);

  const promiseArray = await Promise.all(
    subset.map((item: number) => fetch(`${API_URL}/item/${item}.json`)),
  );

  const items: story[] = await Promise.all(
    promiseArray.map(x => x.json()),
  ).then(x => x.filter(Boolean));

  items.forEach(item =>
    document.body.appendChild(
      html`
        <div>${item.title}</div>
      `,
    ),
  );
})();
