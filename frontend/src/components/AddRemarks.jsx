import React, { useState } from 'react';

/**
 * AddRemarkForm
 * Props:
 * - reviewerGroups: object mapping group -> names
 * - onAdd: async function(payload) => updatedUser
 */
const AddRemarkForm = ({ reviewerGroups, onAdd }) => {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(8);
  const [year, setYear] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    if (!text.trim()) { setError('Please write a remark first.'); return; }

    setLoading(true);
    try {
      const payload = { text: text.trim(), rating: Number(rating) };
      const reviewerTrim = reviewer.trim();
      if (reviewerTrim) payload.by = reviewerTrim;

      const updated = await onAdd(payload);
      // if parent returns the new user, we can clear fields
      if (updated) {
        setText(''); setRating(8); setReviewer(''); setYear('');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || 'Failed to submit remark');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-soft">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Add Remark & Rating</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write performance notes (communication, technical, attitude...)"
          rows={4}
          className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Year</label>
            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); setReviewer(''); }}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select Year</option>
              {Object.keys(reviewerGroups).map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Name</label>
            <select
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              disabled={!year}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 shadow-sm appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Reviewer</option>
              {year && reviewerGroups[year].map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0–10)</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min="0" max="10" value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full" />
              <div className="px-3 py-1 rounded bg-gray-100 font-semibold text-sm">{rating}</div>
            </div>
          </div>

        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Saving...' : 'Save Remark'}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default AddRemarkForm;