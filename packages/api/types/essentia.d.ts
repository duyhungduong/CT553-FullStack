declare module "essentia.js" {
  export class Essentia {
    constructor(wasm: any);
    version: string;
    arrayToVector: (array: Float32Array) => any;
    PercivalBpmEstimator: (signal: any) => { bpm: number };
    KeyExtractor: (signal: any) => { key: string };
    RhythmExtractor: (signal: any) => { timeSignature?: string };
    deleteVector: (vector: any) => void;
    shutdown: () => void;
  }
}

declare module "essentia.js/dist/essentia-wasm.module.js" {
  const EssentiaWASM: any;
  export default EssentiaWASM;
}
