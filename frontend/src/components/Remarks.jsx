import React, { useState } from 'react';
import { updateRemark, deleteRemark } from '../api/api';

// Helper: find designation (case-insensitive)
const getDesignationFor = (by, reviewerGroups) => {
  if (!by) return '';
  const lower = by.toLowerCase();
  for (const [role, names] of Object.entries(reviewerGroups)) {
    if (names.some(n => n.toLowerCase() === lower)) return role.replace(/_/g, ' ');
  }
  return '';
};

const RemarkItem = ({ remark, userId, onUserReplace, reviewerGroups }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(remark.text);
  const [editRating, setEditRating] = useState(remark.rating);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const designation = getDesignationFor(remark.by, reviewerGroups);

  const handleSave = async () => {
    setErr('');
    if (!editText.trim()) { setErr('Text cannot be empty.'); return; }
    if (editRating < 0 || editRating > 10) { setErr('Rating must be 0–10.'); return; }

    setSaving(true);
    try {
      const updatedUser = await updateRemark(userId, remark._id, { text: editText.trim(), rating: Number(editRating) });
      onUserReplace(updatedUser);
      setIsEditing(false);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to update remark');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this remark?')) return;
    setSaving(true); setErr('');
    try {
      const updatedUser = await deleteRemark(userId, remark._id);
      onUserReplace(updatedUser);
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to delete remark');
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between gap-4">
      <div className="flex-1">
        {isEditing ? (
          <>
            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} className="w-full border rounded p-2 mb-2" />
            <div className="flex items-center gap-3 mb-2">
              <label className="text-sm text-gray-700">Rating</label>
              <input type="number" min="0" max="10" value={editRating} onChange={(e) => setEditRating(Number(e.target.value))} className="border rounded p-1 w-20" />
            </div>
            {err && <div className="text-red-600 text-xs mb-2">{err}</div>}
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => { setIsEditing(false); setEditText(remark.text); setEditRating(remark.rating); }} disabled={saving} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-800 italic">"{remark.text}"</p>
            <div className="mt-2 text-xs text-gray-500">
              <span className="font-semibold">{remark.by || 'Interviewer'}</span>
              {designation && <div className="text-gray-700 font-bold">{designation}</div>}

              <br />
              
              
              <span>{new Date(remark.createdAt).toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {!isEditing && (
        <div className="flex flex-col items-start sm:items-end gap-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm font-semibold">{remark.rating}/10</div>
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(true)} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Edit</button>
            <button onClick={handleDelete} disabled={saving} className="bg-red-600 text-white px-2 py-1 rounded text-xs disabled:opacity-60">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemarkItem;