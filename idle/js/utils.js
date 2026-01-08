export function formatNumber(value) {
  if (value === null || value === undefined) return '0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  if (abs > 0 && abs < 1000 && !Number.isInteger(value)) {
    return value.toFixed(1);
  }
  return Math.floor(value).toString();
}

export function formatMultiplier(value) {
  return `x${value.toFixed(2)}`;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
