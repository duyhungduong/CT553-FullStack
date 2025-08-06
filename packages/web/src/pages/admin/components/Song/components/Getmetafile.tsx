import { useState, useEffect } from "react";
import { AlertCircle, Music, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Mood =
  | "peaceful"
  | "relaxing"
  | "melancholic"
  | "romantic"
  | "uplifting"
  | "energetic"
  | "dramatic"
  | "mysterious"
  | "triumphant"
  | "ethereal"
  | "contemplative"
  | "hopeful";

type TimeSignature =
  | "4/4"
  | "3/4"
  | "2/2"
  | "6/8"
  | "9/8"
  | "12/8"
  | "5/4"
  | "7/4";

type KeySignature =
  | "C"
  | "G"
  | "D"
  | "A"
  | "E"
  | "B"
  | "F#"
  | "C#"
  | "F"
  | "Bb"
  | "Eb"
  | "Ab"
  | "Db"
  | "Gb"
  | "Am"
  | "Em"
  | "Bm"
  | "F#m"
  | "C#m"
  | "G#m"
  | "D#m"
  | "A#m"
  | "Dm"
  | "Gm"
  | "Cm"
  | "Fm"
  | "Bbm"
  | "Ebm";

interface Metadata {
  mood: Mood[];
  tempo: number;
  keySignature: KeySignature;
  timeSignature: TimeSignature;
}
interface Props {
  audioFile: File;
  onMetadataChange: (metadata: Metadata) => void;
}

const MusicMetadataEditor = ({ audioFile, onMetadataChange }: Props) => {
  const [metadata, setMetadata] = useState<Metadata>({
    mood: [],
    tempo: 120,
    keySignature: "C",
    timeSignature: "4/4",
  });

  const [originalMetadata, setOriginalMetadata] = useState<Metadata | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const moodOptions: Record<Mood, string> = {
    peaceful: "Calm and serene",
    relaxing: "Stress-reducing",
    melancholic: "Sad or thoughtful",
    romantic: "Love and emotion",
    uplifting: "Positive and inspiring",
    energetic: "Dynamic and lively",
    dramatic: "Intense and powerful",
    mysterious: "Enigmatic and intriguing",
    triumphant: "Victorious and grand",
    ethereal: "Heavenly and delicate",
    contemplative: "Deep and reflective",
    hopeful: "Optimistic and bright",
  };

  const keySignatureOptions: KeySignature[] = [
    "C", "G", "D", "A", "E", "B", "F#", "C#", "F", "Bb", "Eb", "Ab", "Db", "Gb",
    "Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "A#m", "Dm", "Gm", "Cm", "Fm", "Bbm", "Ebm"
  ];
  
  const timeSignatureOptions: TimeSignature[] = [
    "4/4", "3/4", "2/2", "6/8", "9/8", "12/8", "5/4", "7/4"
  ];
  

  const extractMetadata = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await fetch("/api/extract-metadata", {
        method: "POST",
        body: audioFile,
      });

      const extractedMetadata = await response.json();

      // Validate extracted metadata
      const validatedMetadata = validateMetadata(extractedMetadata);
      setOriginalMetadata(validatedMetadata);
      setMetadata(validatedMetadata);
      setIsDirty(false);
    } catch (err) {
      console.log(err);
      setError(
        new Error("Failed to extract metadata. Please select manually.")
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analyze mood using AI
  const analyzeMoodWithAI = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await fetch("/api/analyze-mood", {
        method: "POST",
        body: audioFile,
      });

      const { predictedMoods } = await response.json();

      setMetadata((prev) => ({
        ...prev,
        mood: predictedMoods,
      }));
      setIsDirty(true);
    } catch (err) {
      console.log(err);
      setError(new Error("Failed to analyze mood. Please select manually."));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validateMetadata = (meta: any): Metadata => {
    return {
        mood: Array.isArray(meta.mood)
        ? meta.mood.filter((m: any) => m in moodOptions)
        : [],
      tempo:
        Number.isFinite(meta.tempo) && meta.tempo >= 20 && meta.tempo <= 300
          ? meta.tempo
          : 120,
      keySignature: keySignatureOptions.includes(meta.keySignature)
        ? meta.keySignature
        : "C",
      timeSignature: timeSignatureOptions.includes(meta.timeSignature)
        ? meta.timeSignature
        : "4/4",
    };
  };

  const handleChange = <T extends keyof Metadata>(
    field: T,
    value: Metadata[T]
  ) => {
    setMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
  };

  const handleReset = () => {
    if (originalMetadata) {
      setMetadata(originalMetadata);
      setIsDirty(false);
    }
  };

  useEffect(() => {
    if (isDirty) {
      onMetadataChange(metadata);
    }
  }, [metadata, isDirty]);

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Music className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Music Metadata Editor</h2>
        </div>
        <div className="space-x-2">
          <button
            onClick={extractMetadata}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isAnalyzing}
          >
            Extract Metadata
          </button>
          <button
            onClick={analyzeMoodWithAI}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            disabled={isAnalyzing}
          >
            Analyze Mood (AI)
          </button>
          {isDirty && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Mood Selection */}
        <div className="space-y-2">
          <label className="font-medium">Mood</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(moodOptions).map(([mood, description]) => (
              <div key={mood} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={metadata.mood.includes(mood as Mood)}
                  onChange={(e) => {
                    const newMoods = e.target.checked
                      ? [...metadata.mood, mood as Mood]
                      : metadata.mood.filter((m) => m !== mood);
                    handleChange("mood", newMoods);
                  }}
                  className="rounded"
                />
                <span title={description}>{mood}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Other Metadata Fields */}
        <div className="space-y-4">
          <div>
            <label className="font-medium">Tempo (BPM)</label>
            <input
              type="number"
              value={metadata.tempo}
              onChange={(e) => handleChange("tempo", Number(e.target.value))}
              min="20"
              max="300"
              className="w-full mt-1 rounded-md border"
            />
          </div>

          <div>
            <label className="font-medium">Key Signature</label>
            <select
              value={metadata.keySignature}
              onChange={(e) => handleChange("keySignature", e.target.value as KeySignature)}
              className="w-full mt-1 rounded-md border"
            >
              {keySignatureOptions.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium">Time Signature</label>
            <select
              value={metadata.timeSignature}
              onChange={(e) => handleChange("timeSignature", e.target.value as TimeSignature)}
              className="w-full mt-1 rounded-md border"
            >
              {timeSignatureOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isAnalyzing && (
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Analyzing...</span>
        </div>
      )}

      {isDirty && (
        <div className="flex items-center space-x-2 text-amber-600">
          <AlertCircle className="w-4 h-4" />
          <span>Unsaved changes</span>
        </div>
      )}
    </div>
  );
};

export default MusicMetadataEditor;
