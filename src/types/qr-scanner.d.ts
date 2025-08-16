declare module 'qr-scanner' {
  export default class QrScanner {
    constructor(
      video: HTMLVideoElement,
      onDecode: (result: { data: string }) => void,
      options?: {
        preferredCamera?: string;
        highlightScanRegion?: boolean;
        highlightCodeOutline?: boolean;
      }
    );
    start(): Promise<void>;
    stop(): void;
    destroy(): void;
  }
}