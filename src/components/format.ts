// Cene u formatu "2.420 RSD" (MASTER 8).
export function formatRsd(value: number) {
  return `${value.toLocaleString("sr-RS")} RSD`;
}

export function formatNumber(value: number) {
  return value.toLocaleString("sr-RS");
}
