export type Category = "나" | "함께";

export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: Category;
}

export interface SearchResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
}
