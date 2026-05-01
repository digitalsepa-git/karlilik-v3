export function formatValue(value, format) {
  if (value === null || value === undefined) return "—";
  
  switch (format) {
    case "currency": 
      return `₺ ${value.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case "percent": 
      return `${(value * 100).toFixed(1)}%`;
    case "number": 
      return value.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    default:
      return String(value);
  }
}
