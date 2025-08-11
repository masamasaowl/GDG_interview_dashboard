import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import StudentCard from './StudentCard';


const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UserDetailsPage = () => {

  // for user declaration
  const { id } = useParams();
  const [user, setUser] = useState(null);

  // for review submission
  const [text, setText] = useState('');
  const [rating, setRating] = useState(8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // for reviewer
  const [reviewer, setReviewer] = useState('');


  // fetch the user from route
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/users/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [id]);


  // submitting the review
  const handleSubmit = async (e) => {
    e?.preventDefault();

    // handle error
    setError('');
    if (!text.trim()) {
      setError('Please write a remark first.');
      return;
    }
    setIsSubmitting(true);
    try {

      // check incoming request name
      console.log({
        text,
        rating: Number(rating),
        by: reviewer || 'Interviewer'
      });


      // send response to review route
      const res = await axios.post(`${API}/users/remarks/${id}`, {

        text,
        rating: Number(rating),
        by: reviewer || 'Interviewer'
      });

      // update new user, fields & reviewer
      setUser(res.data);       
      setText('');
      setRating(8);
      setReviewer('');

    } catch (err) {
      // errors to review route
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit remark');
    } finally {

      setIsSubmitting(false);
    }
  };


  // for loading
  if (!user) return <p className="text-center mt-10 text-gray-500">Loading user...</p>;

  
  return (

    // return to dashboard
    <div className="p-6 min-h-screen bg-gray-100">
      <Link to="/" className="text-blue-600 hover:underline">&larr; Back to Table</Link>

      {/* display user as a card */}
      <div className="mt-4 max-w-3xl mx-auto">
        <StudentCard user={user} />


        {/* Remarks & Rating */}
        <div className="mt-6 bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Add Remark & Rating</h3>


          {/* input box */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write performance notes "
              rows={4}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring"
            />

            {/* Interviewer */}
            <div>
              <label className="block text-sm font-medium mb-1">Reviewer Name</label>
              <input
                type="text"
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
                placeholder="e.g. Nishant sir "
                className="w-full border rounded-md p-2 focus:outline-none focus:ring"
              />
            </div>

            {/* rating */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Rating (0-10)</label>
              <input
                type="range"
                min="0"
                max="10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-48"
              />
              <div className="px-3 py-1 rounded bg-gray-100 font-semibold">{rating}</div>
              <button
                disabled={isSubmitting}
                className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                type="submit"
              >
                {isSubmitting ? 'Saving...' : 'Save Remark'}
              </button>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        </div>

        {/* Show previous remarks list */}
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-2">Remarks</h4>
          <div className="space-y-3">
            {user.remarks && user.remarks.length > 0 ? (
              user.remarks.slice().reverse().map((r, i) => (
                <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-700 italic">"{r.text}"</p>
                      <p className="text-xs text-gray-500 mt-1">by: {r.by || 'Interviewer'}</p>
                    </div>
                    <div className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100">
                      {r.rating}/10
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
              ))

              // In case no remarks
            ) : (
              <p className="text-sm text-gray-500">No remarks yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
