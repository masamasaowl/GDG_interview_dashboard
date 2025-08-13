// src/pages/StudentDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StudentCard from './StudentCard';
import AddRemarkForm from './AddRemarks';
import RemarkItem from './Remarks';
import { getUserById, addRemark } from '../api/api';

const reviewerGroups = {
  Joint_Secretary: [
    "Abhishek","Aryan Pratap Singh","Peush Yadav","Aryan Singh","Vivek Sharma",
    "Pranav Patil","Ayush Kumar","Anu Kumari","Palak","Sreyash Singh",
    "Nithesh Yadav","Shashwat Trivedi","Ashutosh Mishra","Arsh Tiwari","Raj Singh"
  ],
  Secretary: ["Nishant Singh","Divyanshi Choudhary"],
  TE_Member: [
    "Sanshey","Arun Kumar Kushwaha","Ashutosh Singh","Pavan",
    "Srijan Tripathi","Rishabh Kumar","Aayush Kumar"
  ]
};

const StudentDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const data = await getUserById(id);
        if (!cancelled) setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchUser();
    return () => { cancelled = true; };
  }, [id]);

  // Called by AddRemarkForm when a new remark is added
  const handleAdd = async (payload) => {
    const updated = await addRemark(id, payload);
    setUser(updated);
    return updated;
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading user...</p>;
  if (!user) return <p className="text-center mt-10 text-gray-500">User not found</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-block text-blue-600 hover:underline mb-4">&larr; Back to Dashboard</Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: student card */}
          <div>
            <StudentCard user={user} />
            <div className="mt-4 text-sm text-gray-500">
              <div><strong>Submitted:</strong> {new Date(user.createdAt).toLocaleString()}</div>
              <div className="mt-2 text-xs">ID: <span className="text-gray-700">{user._id}</span></div>
            </div>
          </div>

          {/* Right columns: add remark + remarks list */}
          <div className="md:col-span-2 space-y-6">
            <AddRemarkForm reviewerGroups={reviewerGroups} onAdd={handleAdd} />

            <div>
              <h4 className="text-md font-semibold mb-3">Remarks</h4>
              <div className="space-y-3">
                {user.remarks && user.remarks.length > 0 ? (
                  user.remarks.slice().reverse().map((r) => (
                    <RemarkItem
                      key={r._id}
                      remark={r}
                      userId={user._id}
                      onUserReplace={setUser}
                      reviewerGroups={reviewerGroups}
                    />
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
