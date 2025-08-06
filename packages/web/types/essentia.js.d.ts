declare module "essentia.js" {
  export class Essentia {
    constructor(wasmModule: any);
    PercivalBpmEstimator(audio: Float32Array, sampleRate: number): { bpm: number };
    KeyExtractor(audio: Float32Array, sampleRate: number): { key: string; scale: string };
    RhythmExtractor(audio: Float32Array, sampleRate: number): { beats: number[] };
    Energy(audio: Float32Array): { energy: number };
    // Add other methods as needed
  }
  export const EssentiaWASM: any; // Placeholder for the WASM module
}