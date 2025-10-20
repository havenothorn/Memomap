export type Category = "visited" | "wishlist" | "recommended";

export interface PlacePin {
  id: string;
  title: string;
  memo?: string;
  category: Category;
  position: google.maps.LatLngLiteral;
}
