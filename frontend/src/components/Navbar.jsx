import React from "react";

// This component creates a navigation bar for the top of the page.
const Navbar = () => {
  return (
    // The header is the main container for the entire navigation bar.
    <header className="bg-white">
      {/* This container sets the maximum width and adds horizontal padding. It's centered on the page. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* This is a flexbox container that aligns its children vertically and places them at opposite ends. */}
        <div className="flex items-center justify-between h-16">
          
          {/* This section holds the logo and the group's name. */}
          <div className="flex items-center gap-3">
            {/* The link wraps the logo and directs the user to the homepage. */}
            <a href="/">
                {/* The logo image. */}
                <img 
                src="/dsc-logo.webp" 
                alt="GDG Logo"
                className="w-10 h-10 object-contain"
                />
            </a>
            
            {/* The group's name, which is slightly smaller on small screens for better readability. */}
            <span className="text-xl sm:text-2xl font-medium text-gray-800">
              Google Developers Group
            </span>
          </div>
          
          {/* This section contains buttons and other actions on the right side of the navigation bar. */}
          <div className="flex items-center gap-3">
            {/* The button is a link to an external website. */}
            <a href="https://www.gdgaitpune.me/" target="_blank">
                <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700">+ Add Student</button>
            </a>
            
          </div>
        </div>

        {/* This is a small decorative ribbon below the main navbar. */}
        <div className="mt-3 gdg-ribbon" />
      </div>
    </header>
  );
};

export default Navbar;
