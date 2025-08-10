import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">Student Forms</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Domain</th>
              <th className="px-6 py-3 text-left">Branch</th>
              <th className="px-6 py-3 text-left">Priority</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr
                key={user._id}
                className="hover:bg-blue-50 cursor-pointer border-b"
                onClick={() => navigate(`/user/${user._id}`)}
              >
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.domain}</td>
                <td className="px-6 py-4">{user.branch}</td>
                <td className="px-6 py-4">#{user.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
