import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Reorder buttons for admin list items. Swaps positions in the local list,
 * renumbers everyone (gap of 10) via the supplied update fn, then reloads.
 * Why renumber all: users can have tied sort_orders (default 0), so swapping
 * values alone would not visibly change order. Reassigning 10, 20, 30... also
 * leaves room to manually insert later.
 */
export function useReorder({ items, updateFn, load, toast }) {
  const move = async (idx, delta) => {
    const target = idx + delta;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
    try {
      // Sequential (not Promise.all) so the sql.js-backed server never sees
      // overlapping writes. Also surfaces errors at the first failing item
      // instead of letting half the updates silently succeed.
      for (let i = 0; i < reordered.length; i++) {
        const it = reordered[i];
        const targetSort = (i + 1) * 10;
        if (it.sort_order === targetSort) continue; // skip if already correct
        await updateFn(it.id, { ...it, sort_order: targetSort });
      }
      toast('Sıralama güncellendi');
      load();
    } catch (err) {
      toast(err.message || 'Sıralama kaydedilemedi', 'error');
      load();
    }
  };
  return move;
}

export default function ReorderControls({ idx, total, onMove, className = '' }) {
  return (
    <div className={`inline-flex flex-col ${className}`}>
      <button
        type="button"
        onClick={() => onMove(idx, -1)}
        disabled={idx === 0}
        className="p-0.5 text-slate-400 hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed transition"
        title="Yukarı taşı"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onMove(idx, 1)}
        disabled={idx === total - 1}
        className="p-0.5 text-slate-400 hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed transition"
        title="Aşağı taşı"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
}
