import { useState } from 'react';
import { OBJECT_FORM_FIELDS } from './config';

function RecordModal({ objectType, record, onClose, onSubmit }) {
  const fields = OBJECT_FORM_FIELDS[objectType];
  const isEdit = Boolean(record);

  const initialData = {};
  fields.forEach((f) => {
    initialData[f.name] = record?.[f.name] ?? '';
  });

  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    for (const f of fields) {
      if (f.required && !String(formData[f.name] ?? '').trim()) {
        setError(`${f.label} is required.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? `Edit ${objectType}` : `Create New ${objectType}`}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  value={formData[f.name]}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              ) : (
                <input
                  type={f.type}
                  value={formData[f.name]}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-medium disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordModal;
