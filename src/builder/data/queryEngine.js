import { METRIC_REGISTRY } from "./metricRegistry";
import { getOrdersData } from "./adapters/ordersAdapter";

const ADAPTERS = {
  orders: getOrdersData,
  // we can add other adapters as needed
};

export async function executeQuery(q) {
  // 1. Get data
  const adapter = ADAPTERS[q.source];
  if (!adapter) throw new Error(`Unknown source: ${q.source}`);
  let rows = adapter();

  // 2. Apply filters
  if (q.filters) {
    rows = applyFilters(rows, q.filters);
  }

  // 3. Group by dimensions + aggregate metrics
  let result;
  if (q.dimensions && q.dimensions.length > 0) {
    result = groupAndAggregate(rows, q.dimensions, q.metrics);
  } else {
    result = [aggregate(rows, q.metrics)];
  }

  // 4. Sort
  if (q.sort) {
    result.sort((a, b) => 
      q.sort.dir === "asc" ? a[q.sort.field] - b[q.sort.field] : b[q.sort.field] - a[q.sort.field]
    );
  }

  // 5. Limit
  if (q.limit) result = result.slice(0, q.limit);

  return { data: result, total: result.length, source: q.source };
}

function applyFilters(rows, f) {
  return rows.filter(r => {
    if (f.date && !inDateRange(r.date, f.date)) return false;
    if (f.channel && r.channel !== f.channel) return false;
    if (f.category && r.category !== f.category) return false;
    if (f.productSku && r.sku !== f.productSku) return false;
    return true;
  });
}

function inDateRange(rowDate, range) {
  const d = new Date(rowDate);
  const now = new Date();
  switch (range) {
    case "today": return isSameDay(d, now);
    case "yesterday": return isSameDay(d, addDays(now, -1));
    case "last7days": return d >= addDays(now, -7);
    case "last30days": return d >= addDays(now, -30);
    case "last90days": return d >= addDays(now, -90);
    case "thisMonth": return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    case "lastMonth": { 
      const lm = addMonths(now, -1); 
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear(); 
    }
    case "ytd": return d.getFullYear() === now.getFullYear();
    default: return true;
  }
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function groupAndAggregate(rows, dims, metrics) {
  const groups = new Map();
  rows.forEach(r => {
    // Treat date dimension specially to format it YYYY-MM-DD
    const keyParts = dims.map(d => {
        if (d === 'date') return r[d].split('T')[0];
        return r[d];
    });
    const key = keyParts.join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  });

  return Array.from(groups.entries()).map(([key, group]) => {
    const result = {};
    const keyParts = key.split("|");
    dims.forEach((d, i) => result[d] = keyParts[i]);
    
    metrics.forEach(m => {
      const def = METRIC_REGISTRY[m];
      if (!def) return;
      result[m] = aggregateValue(group, def);
    });
    return result;
  });
}

function aggregateValue(rows, def) {
  const values = rows.map(r => r[def.field]).filter(v => typeof v === "number");
  switch (def.aggregation) {
    case "sum": return values.reduce((a, b) => a + b, 0);
    case "avg": return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    case "count": return rows.length;
    case "min": return Math.min(...values);
    case "max": return Math.max(...values);
    default: return 0;
  }
}

function aggregate(rows, metrics) {
  const result = {};
  metrics.forEach(m => {
    const def = METRIC_REGISTRY[m];
    if (def) result[m] = aggregateValue(rows, def);
  });
  return result;
}
