export const generateTrackingId = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `TRK-${dateStr}-${random}`;
};
