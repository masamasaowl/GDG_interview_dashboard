import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import StudentCard from './StudentCard';

const StudentDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/users/${id}`)
      .then(res => setUser(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!user) return <p className="text-center mt-10 text-gray-500">Loading user...</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <Link to="/" className="text-blue-600 hover:underline">&larr; Back to Table</Link>
      <div className="mt-4">
        <StudentCard user={user} />
      </div>
    </div>
  );
};

export default StudentDetails;
