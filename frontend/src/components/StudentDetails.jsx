// StudentDetails.jsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StudentCard from './StudentCard';
import { getUserById, addRemark } from "../api/api";


const StudentDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  // remark form state
  const [text, setText] = useState('');
  const [rating, setRating] = useState(8);
  const [reviewer, setReviewer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // fetch user (simple)
  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const data = await getUserById(id);
        if (!cancelled) setUser(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");

    if (!text.trim()) {
      setError("Please write a remark first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        text: text.trim(),
        rating: Number(rating),
      };

      const reviewerTrim = reviewer.trim();
      if (reviewerTrim) payload.by = reviewerTrim;

      const updatedUser = await addRemark(id, payload); // API call via service file
      setUser(updatedUser);
      setText("");
      setRating(8);
      setReviewer("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to submit remark");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <p className="text-center mt-10 text-gray-500">Loading user...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* back button */}
        <Link to="/" className="inline-block text-blue-600 hover:underline mb-4">&larr; Back to Dashboard</Link>

        {/* layout: card left, remarks right (stacks on small screens) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* left column: student card */}
          <div>
            <StudentCard user={user} />

            <div className="mt-4 text-sm text-gray-500">
              <div><strong>Submitted:</strong> {new Date(user.createdAt).toLocaleString()}</div>
              <div className="mt-2 text-xs">ID: <span className="text-gray-700">{user._id}</span></div>
            </div>
          </div>

          {/* right columns: form + remarks */}
          <div className="md:col-span-2 space-y-6">

            {/* Add Remark */}
            <div className="bg-white p-5 rounded-xl shadow-soft">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Add Remark & Rating</h3>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* remark text */}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write performance notes (communication, technical, attitude...)"
                  rows={4}
                  className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  aria-label="Remark text"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">

                  {/* reviewer name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Name</label>
                    <input
                      type="text"
                      value={reviewer}
                      onChange={(e) => setReviewer(e.target.value)}
                      placeholder="e.g. Nishant Sir"
                      className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      aria-label="Reviewer name"
                    />
                  </div>

                  {/* rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0–10)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full"
                        aria-label="Rating"
                      />
                      <div className="px-3 py-1 rounded bg-gray-100 font-semibold text-sm">{rating}</div>
                    </div>
                  </div>

                  {/* submit */}
                  <div className="flex items-end justify-end">
                    <button
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60 w-full sm:w-auto"
                      type="submit"
                      aria-label="Save remark"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Remark'}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}
              </form>
            </div>

            {/* Remarks list */}
            <div>
              <h4 className="text-md font-semibold mb-3">Remarks</h4>
              <div className="space-y-3">
                {user.remarks && user.remarks.length > 0 ? (
                  user.remarks.slice().reverse().map((r, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-800 italic">"{r.text}"</p>
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-semibold">{r.by || 'Interviewer'}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(r.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start sm:items-end">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm font-semibold">
                          {r.rating}/10
                        </div>
                        {/* small actions placeholder (edit/delete) */}
                        <div className="text-xs text-gray-400 mt-2">{/* actions */}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No remarks yet</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
