// types/sticker.ts
export enum StickerCategory {
  Emotions = "Emotions",
  Animals = "Animals",
  Cartoon = "Cartoon",
  Music = "Music",
  Food = "Food",
  Travel = "Travel",
  Sports = "Sports",
  Funny = "Funny",
  Festivals = "Festivals",
  Love = "Love",
  Game = "Game",
  Weather = "Weather",
  Tech = "Tech",
  Art = "Art",
  Others = "Others",
}

// Danh sách tất cả categories dưới dạng mảng để dễ sử dụng
export const STICKER_CATEGORIES = Object.values(StickerCategory);
