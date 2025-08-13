import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getAllUsers } from "../api/api";
import Searchbar from "./Searchbar";

// Small component to show priority levels with colors
const PriorityBadge = ({ p }) => {
  const pri = Number(p);
  const map = {
    1: "bg-red-100 text-red-800",
    2: "bg-yellow-100 text-yellow-800",
    3: "bg-green-100 text-green-800"
  };
  const className = map[pri] || "bg-gray-100 text-gray-800";
  const label = pri === 1 ? "High" : pri === 2 ? "Medium" : pri === 3 ? "Low" : String(p || "-");

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
};

// Main dashboard that shows all students in a table or cards based on screen size
const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load all users when component first mounts
  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const data = await getAllUsers();
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (!cancelled) setError("Failed to load users. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUsers();
    return () => { cancelled = true; };
  }, []);

  // Get the most recent rating from a user's remarks
  const getLatestRating = (user) => {
    const r = user.remarks;
    if (!r || !r.length) return null;
    const last = r[r.length - 1];
    return typeof last.rating === "number" ? last.rating : null;
  };

  // Filter users based on search term and selected field
  const filterUsers = () => {
    const q = searchTerm.trim().toLowerCase();
    
    return users.filter((user) => {
      if (!q) return true;

      if (searchField === "name") {
        return (user.name || "").toLowerCase().includes(q);
      }

      if (searchField === "reg") {
        return (user.reg || "").toLowerCase().includes(q);
      }

      if (searchField === "priority") {
        const mapping = { high: "1", medium: "2", low: "3" };
        if (mapping[q]) {
          return String(user.priority) === mapping[q];
        }
        const num = Number(q);
        if (!Number.isNaN(num)) {
          return Number(user.priority) === num;
        }
        return String(user.priority || "").toLowerCase().includes(q);
      }

      if (searchField === "rating") {
        const num = Number(q);
        const latest = getLatestRating(user);
        if (Number.isFinite(num) && latest !== null) {
          return latest >= num;
        }
        return latest !== null && String(latest).toLowerCase().includes(q);
      }

      return true;
    });
  };

  const filteredUsers = filterUsers();

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center text-gray-500 py-8">Loading users…</div>
        </main>
      </div>
    );
  }

  // Show error message if API call failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Search bar that works on all screen sizes */}
        <Searchbar
          value={searchTerm}
          field={searchField}
          onChange={(q, f) => {
            setSearchTerm(q);
            if (f) setSearchField(f);
          }}
          onSearch={(q, f) => {
            setSearchTerm(q);
            if (f) setSearchField(f);
          }}
        />

        {/* Page header with title and results count */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Interview Candidates</h2>
          <p className="text-sm text-gray-500">{filteredUsers.length} results</p>
        </div>

        {/* Desktop table view */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Regn no
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    tabIndex={0}
                    onClick={() => navigate(`/user/${user._id}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/user/${user._id}`); }}
                    className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center text-sm font-medium text-gray-700 flex-shrink-0">
                          {user.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'NA'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                          <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="truncate block max-w-32">{user.domain || '-'}</span>
                    </td>

                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.reg || '-'}</td>

                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="truncate block max-w-28">{user.branch || '-'}</span>
                    </td>

                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm">
                      <PriorityBadge p={user.priority} />
                    </td>

                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.remarks?.length > 0
                        ? `${user.remarks[user.remarks.length - 1].rating}/10`
                        : '-'}
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile and tablet card view */}
        <div className="lg:hidden space-y-3 sm:space-y-4">
          {filteredUsers.map((user) => (
            <article
              key={user._id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/user/${user._id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/user/${user._id}`); }}
              className="bg-white p-4 sm:p-5 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center text-sm font-medium text-gray-700 flex-shrink-0">
                  {user.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'NA'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-medium text-gray-900 truncate">{user.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
                    </div>

                    <div className="flex-shrink-0">
                      <PriorityBadge p={user.priority} />
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">Branch:</span> {user.branch || '-'}
                    </div>
                    
                    <div className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">Domain:</span> {user.domain || '-'}
                    </div>
                    
                    <div className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">Reg:</span> {user.reg || '-'}
                    </div>
                    
                    <div className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">Rating:</span> {user.remarks?.length > 0
                        ? `${user.remarks[user.remarks.length - 1].rating}/10`
                        : 'Not rated'}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
              No users found matching your search.
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;