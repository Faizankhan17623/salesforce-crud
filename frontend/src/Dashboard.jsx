import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL, OBJECT_TYPES } from './config';
import RecordTable from './RecordTable';
import RecordModal from './RecordModal';
import { useToast } from './Toast';

const PAGE_SIZE = 20;

function Dashboard({ token, instance }) {
  const [objectType, setObjectType] = useState('Account');
  const [records, setRecords] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const showToast = useToast();

  const fetchRecords = useCallback(
    async (currentOffset, append, searchTerm) => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/api/records/${objectType}`, {
          params: { token, instance, offset: currentOffset, search: searchTerm },
        });
        const newRecords = res.data;
        setRecords((prev) => (append ? [...prev, ...newRecords] : newRecords));
        setHasMore(newRecords.length === PAGE_SIZE);
        setOffset(currentOffset + newRecords.length);
      } catch (err) {
        setError(err.response?.data?.error?.message || err.message || 'Failed to load records.');
      } finally {
        setLoading(false);
      }
    },
    [objectType, token, instance]
  );

  useEffect(() => {
    setRecords([]);
    setOffset(0);
    setHasMore(true);
    setSelectedIds(new Set());
    fetchRecords(0, false, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setRecords([]);
      setOffset(0);
      setHasMore(true);
      setSelectedIds(new Set());
      fetchRecords(0, false, searchInput);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchRecords(offset, true, search);
    }
  };

  const refresh = () => {
    setRecords([]);
    setOffset(0);
    setHasMore(true);
    setSelectedIds(new Set());
    fetchRecords(0, false, search);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (visibleRecords, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      visibleRecords.forEach((r) => (checked ? next.add(r.Id) : next.delete(r.Id)));
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected ${objectType} record(s)? This cannot be undone.`)) {
      return;
    }
    setBulkDeleting(true);
    const ids = Array.from(selectedIds);
    let failures = 0;
    for (const id of ids) {
      try {
        await axios.delete(`${API_BASE_URL}/api/records/${objectType}/${id}`, {
          params: { token, instance },
        });
      } catch {
        failures++;
      }
    }
    setBulkDeleting(false);
    if (failures === 0) {
      showToast(`${ids.length} record(s) deleted successfully.`, 'success');
    } else {
      showToast(`${ids.length - failures} deleted, ${failures} failed.`, 'error');
    }
    refresh();
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editingRecord) {
        await axios.patch(`${API_BASE_URL}/api/records/${objectType}/${editingRecord.Id}`, {
          token,
          instance,
          ...formData,
        });
        showToast(`${objectType} updated successfully.`, 'success');
      } else {
        await axios.post(`${API_BASE_URL}/api/records/${objectType}`, {
          token,
          instance,
          ...formData,
        });
        showToast(`${objectType} created successfully.`, 'success');
      }
      closeModal();
      refresh();
    } catch (err) {
      showToast(
        err.response?.data?.error?.message || err.message || 'Failed to save record.',
        'error'
      );
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/records/${objectType}/${id}`, {
        params: { token, instance },
      });
      showToast(`${objectType} deleted successfully.`, 'success');
      refresh();
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message || 'Failed to delete record.';
      setError(message);
      showToast(message, 'error');
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-blue-900 text-white px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Salesforce CRUD</h1>
          <span className="text-blue-200 text-sm truncate max-w-xs">{instance}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-slate-700 font-medium">Object:</label>
            <select
              value={objectType}
              onChange={(e) => {
                setObjectType(e.target.value);
                setSearch('');
                setSearchInput('');
              }}
              className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 cursor-pointer"
            >
              {OBJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Search ${objectType}...`}
              className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 w-56"
            />
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
              </button>
            )}
            <button
              onClick={openCreateModal}
              className="bg-blue-900 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg cursor-pointer"
            >
              + Create New
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <RecordTable
          objectType={objectType}
          records={records}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onEdit={openEditModal}
          onDelete={handleDelete}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />
      </main>

      {modalOpen && (
        <RecordModal
          objectType={objectType}
          record={editingRecord}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
}

export default Dashboard;
