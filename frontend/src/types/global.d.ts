export {}

declare global {
  interface Window {
    cancelRequest: Map<symbol, { pathname: string; cancel: () => void }>
  }
}
