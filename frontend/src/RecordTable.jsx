import { useRef, useCallback } from 'react';
import { OBJECT_COLUMNS } from './config';

function RecordTable({ objectType, records, loading, hasMore, onLoadMore, onEdit, onDelete }) {
  const containerRef = useRef(null);
  const columns = OBJECT_COLUMNS[objectType];

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
      <tr key={`${keyPrefix}-${rowIdx}`} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
        {columns.map((col) => (
          <td key={col} className="px-4 py-3">
            <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${60 + ((rowIdx * 13) % 30)}%` }} />
          </td>
        ))}
        <td className="px-4 py-3">
          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
        </td>
      </tr>
    ));

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="border border-slate-200 rounded-lg overflow-auto bg-white shadow-sm"
      style={{ maxHeight: '65vh' }}
    >
      <table className="min-w-full text-sm">
        <thead className="bg-blue-900 text-white sticky top-0">
          <tr>
            {columns.map((col) => (
              <th key={col} className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                {col}
              </th>
            ))}
            <th className="text-left px-4 py-3 font-semibold whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr
              key={record.Id}
              className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
            >
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-slate-700 whitespace-nowrap">
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
              <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-400">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {!loading && records.length > 0 && (
        <div className="text-center py-3 text-slate-400 text-xs">
          {hasMore
            ? `Showing ${records.length} records — scroll down to load more (20 per page)`
            : `Showing all ${records.length} records — no more to load`}
        </div>
      )}
    </div>
  );
}

export default RecordTable;
