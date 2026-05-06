declare module 'dom-to-image' {
  interface DomToImageOptions {
    quality?: number
    width?: number
    height?: number
    style?: Record<string, string>
    bgcolor?: string
    cacheBust?: boolean
  }

  const domtoimage: {
    toJpeg: (node: HTMLElement, options?: DomToImageOptions) => Promise<string>
    toPng: (node: HTMLElement, options?: DomToImageOptions) => Promise<string>
    toSvg: (node: HTMLElement, options?: DomToImageOptions) => Promise<string>
    toBlob: (node: HTMLElement, options?: DomToImageOptions) => Promise<Blob>
  }

  export = domtoimage
}
