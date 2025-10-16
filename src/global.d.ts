/* Minimal JSX typings for Google Maps Web Components used in this project */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "gmp-map": { [key: string]: any };
      "gmpx-api-loader": { [key: string]: any };
      "gmpx-place-picker": { [key: string]: any };
      "gmp-advanced-marker": { [key: string]: any };
    }
  }
}

export {};
