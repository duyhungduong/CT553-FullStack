export const formatDuration = (seconds: number) => {
    const roundedSeconds = Math.ceil(seconds); 
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};