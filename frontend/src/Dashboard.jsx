import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL, OBJECT_TYPES } from './config';
import RecordTable from './RecordTable';
import RecordModal from './RecordModal';

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
    fetchRecords(0, false, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setRecords([]);
      setOffset(0);
      setHasMore(true);
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
    fetchRecords(0, false, search);
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
    if (editingRecord) {
      await axios.patch(`${API_BASE_URL}/api/records/${objectType}/${editingRecord.Id}`, {
        token,
        instance,
        ...formData,
      });
    } else {
      await axios.post(`${API_BASE_URL}/api/records/${objectType}`, {
        token,
        instance,
        ...formData,
      });
    }
    closeModal();
    refresh();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/records/${objectType}/${id}`, {
        params: { token, instance },
      });
      refresh();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to delete record.');
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

          <button
            onClick={openCreateModal}
            className="bg-blue-900 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg cursor-pointer"
          >
            + Create New
          </button>
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
