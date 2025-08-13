import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getAllUsers } from "../api/api";
import Searchbar from "./Searchbar";


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
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
};

/**
 * Dashboard: shows candidates as a table on wide screens and as cards on mobile.
 * - searchTerm is kept locally and passed down to Navbar to update.
 * - the API response may be either an array (res.data) or { data: [...] } depending on backend.
 */
const Dashboard = () => {
  const [users, setUsers] = useState([]);         // all users loaded from API
  const [searchTerm, setSearchTerm] = useState(""); // search input state (shared with Navbar)
  const [loading, setLoading] = useState(true);   // loading indicator
  const [error, setError] = useState("");         // error message (if any)
  const navigate = useNavigate();

  // Fetch users once on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const data = await getAllUsers(); // API call via service file
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (!cancelled)
          setError("Failed to load users. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    
    fetchUsers();
    return () => { cancelled = true; };
  }, []);

  // Client-side filtering (instant). Trim + case-insensitive.
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  // Loading / Error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">Loading users…</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-600">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar with search (searchTerm is lifted here) */}
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Page container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Pill-shaped searchbar centered, ~70% width on md+ and full width on small screens */}
        <Searchbar
          value={searchTerm}
          onChange={(q) => setSearchTerm(q)}   /* live filter while typing */
          onSearch={(q) => setSearchTerm(q)}   /* also update on submit / suggestion click */
        />

        {/* header row: title + results count */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Interview Candidates</h2>
          <p className="text-sm text-gray-500">{filteredUsers.length} results</p>
        </div>

        {/* TABLE (visible on md and larger) */}
        <div className="hidden md:block bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer transition-colors"
                  >
                    {/* Name + email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center text-sm font-medium text-gray-700">
                          {user.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'NA'}
                        </div>

                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Domain */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.domain || '-'}</td>

                    {/* Branch */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.branch || '-'}</td>

                    {/* Priority */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <PriorityBadge p={user.priority} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.remarks?.length > 0
                        ? `${user.remarks[user.remarks.length - 1].rating}/10`
                        : '-'}
                    </td>
                  </tr>
                ))}

                {/* fallback when there are no results */}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE: card list (visible on small screens only) */}
        <div className="md:hidden space-y-4">
          {filteredUsers.map((user) => (
            <article
              key={user._id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/user/${user._id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/user/${user._id}`); }}
              className="bg-white p-4 rounded-lg shadow-soft hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center text-sm font-medium text-gray-700">
                  {user.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'NA'}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500">{user.branch || '-'}</div>
                      <div className="mt-2"><PriorityBadge p={user.priority} /></div>
                    </div>


                    {/* Latest Rating */}
                    <div className="mt-1 text-xs text-gray-500">
                      Rating: {user.remarks?.length > 0
                        ? `${user.remarks[user.remarks.length - 1].rating}/10`
                        : 'Not rated'}
                    </div>

                  </div>

                  <div className="mt-2 text-sm text-gray-700">{user.domain || '-'}</div>
                </div>
              </div>
            </article>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">No users found.</div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
