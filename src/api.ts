import { Story } from './types';

const API_URL = 'https://hacker-news.firebaseio.com/v0';

// fetches an array of new stories. called once on app load
export const fetchAllNewStories = async () => {
  const response = await fetch(`${API_URL}/newstories.json`);
  const parsed: Promise<number[]> = await response.json();
  return parsed;
};

// fetches a single story
export const fetchStory = async (item: number) => {
  const response = await fetch(`${API_URL}/item/${item}.json`);
  const parsed: Promise<Story> = await response.json();
  return parsed;
};
