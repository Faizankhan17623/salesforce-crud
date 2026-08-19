import { useRef, useCallback, useState, useMemo } from 'react';
import { OBJECT_COLUMNS } from './config';

function RecordTable({
  objectType,
  records,
  loading,
  hasMore,
  onLoadMore,
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) {
  const containerRef = useRef(null);
  const columns = OBJECT_COLUMNS[objectType];
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const sortedRecords = useMemo(() => {
    if (!sortColumn) return records;
    const sorted = [...records].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') return aVal - bVal;
      return String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    });
    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [records, sortColumn, sortDirection]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el || loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      onLoadMore();
    }
  }, [loading, hasMore, onLoadMore]);

  const handleDelete = (record) => {
    const label = record.Name || record.Subject || record.Id;
    if (window.confirm(`Are you sure you want to delete "${label}"? This cannot be undone.`)) {
      onDelete(record.Id);
    }
  };

  const skeletonRowCount = records.length === 0 ? 6 : 3;

  const renderSkeletonRows = (keyPrefix) =>
    Array.from({ length: skeletonRowCount }).map((_, rowIdx) => (
      <tr key={`${keyPrefix}-${rowIdx}`} className={rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/60'}>
        <td className="px-4 py-3">
          <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </td>
        {columns.map((col) => (
          <td key={col} className="px-4 py-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" style={{ width: `${60 + ((rowIdx * 13) % 30)}%` }} />
          </td>
        ))}
        <td className="px-4 py-3">
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </td>
      </tr>
    ));

  const allSelected = records.length > 0 && records.every((r) => selectedIds.has(r.Id));

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-auto bg-white dark:bg-slate-800 shadow-sm"
      style={{ maxHeight: '65vh' }}
    >
      <table className="min-w-full text-sm">
        <thead className="bg-blue-900 dark:bg-slate-950 text-white sticky top-0">
          <tr>
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onToggleSelectAll(records, e.target.checked)}
                className="cursor-pointer"
              />
            </th>
            {columns.map((col) => (
              <th
                key={col}
                onClick={() => handleSort(col)}
                className="text-left px-4 py-3 font-semibold whitespace-nowrap cursor-pointer select-none hover:bg-blue-800 dark:hover:bg-slate-800"
              >
                {col}
                {sortColumn === col && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
              </th>
            ))}
            <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((record, idx) => (
            <tr
              key={record.Id}
              className={idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/60'}
            >
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedIds.has(record.Id)}
                  onChange={() => onToggleSelect(record.Id)}
                  className="cursor-pointer"
                />
              </td>
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  {record[col] ?? ''}
                </td>
              ))}
              <td className="px-4 py-2 whitespace-nowrap space-x-2">
                <button
                  onClick={() => onEdit(record)}
                  className="text-blue-900 hover:underline font-medium cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(record)}
                  className="text-red-600 hover:underline font-medium cursor-pointer"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {loading && renderSkeletonRows('skeleton')}
          {records.length === 0 && !loading && (
            <tr>
              <td colSpan={columns.length + 2} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {!loading && records.length > 0 && (
        <div className="text-center py-3 text-slate-400 dark:text-slate-500 text-xs">
          {hasMore
            ? `Showing ${records.length} records — scroll down to load more (20 per page)`
            : `Showing all ${records.length} records — no more to load`}
        </div>
      )}
    </div>
  );
}

export default RecordTable;
