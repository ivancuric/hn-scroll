import { Story } from './types';

// taking into consideration that HN does the sanitizing
export const listItem = (index: number, item: Story): DocumentFragment =>
  document.createRange().createContextualFragment(
    `<li class="list-item">
      <div class="count">${index + 1}.</div>
      <a href=${item.url} target="_blank" rel="noopener">${item?.title}</a>
    </li>`,
  );
