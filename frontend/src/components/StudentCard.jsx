const StudentCard = ({ user }) => {
  const priorityColor = {
    '1': 'bg-red-100 text-red-700',
    '2': 'bg-yellow-100 text-yellow-800',
    '3': 'bg-green-100 text-green-700'
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 border hover:shadow-lg transition duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.domain}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${priorityColor[user.priority] || 'bg-gray-100 text-gray-600'}`}>
          Priority {user.priority}
        </span>
      </div>

      <div className="text-sm text-gray-700">
        <p><strong>Reg:</strong> {user.reg}</p>
        <p><strong>Branch:</strong> {user.branch}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      <div>
        <p className="text-sm text-gray-800 italic">"{user.reason}"</p>
      </div>

      <div>
        <a href={user.bestProject} target="_blank" rel="noopener noreferrer"
           className="inline-block bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          View Best Project
        </a>
      </div>
    </div>
  );
};

export default StudentCard;
