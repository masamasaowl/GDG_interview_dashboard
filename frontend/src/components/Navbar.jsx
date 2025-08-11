import React from "react";

const Navbar = ({ searchTerm, setSearchTerm }) => {
  return (
    <header className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">


          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <a href="/">
                <img 
                src="/dsc-logo.webp" 
                alt="GDG Logo"
                className="w-10 h-10 object-contain"
                />
            </a>
            
            <span className="text-xl font-medium text-gray-800">
              GDG Student Dashboard
            </span>
          </div>


          {/* Search input */}
          <div className="flex-1 max-w-xl mx-6">
            <div className="relative">
              {/* search icon (inline) */}
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"></path>
                </svg>
              </div>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300"
                aria-label="Search by name"
              />
            </div>
          </div>

          {/* Right: small actions (placeholder) */}
          <div className="flex items-center gap-3">
            <a href="https://www.gdgaitpune.me/" target="_blank">
                <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700">Add Student</button>
            </a>
            
          </div>
        </div>

        {/* small GDG multicolor ribbon */}
        <div className="mt-3 gdg-ribbon" />
      </div>
    </header>
  );
};

export default Navbar;
