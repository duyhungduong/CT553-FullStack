export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const sentAt = new Date(timestamp);

  // Kiểm tra timestamp hợp lệ
  if (isNaN(sentAt.getTime())) {
    return "Just now";
  }

  const diffInSeconds = Math.floor((now.getTime() - sentAt.getTime()) / 1000);

  // Dưới 1 phút
  if (diffInSeconds < 60) {
    return "Just now";
  }

  // Dưới 1 giờ
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  // Dưới 1 ngày
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  // Dưới 7 ngày
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  // Trên 7 ngày, hiển thị ngày tháng
  return sentAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }); // Ví dụ: "Oct 15"
};
