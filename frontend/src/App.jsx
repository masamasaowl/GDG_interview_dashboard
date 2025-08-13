import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StudentDetails from './components/StudentDetails';

// Main app component that handles all routing
// Two routes: home dashboard and individual student details page
function App() {
  return (
    <Routes>
      {/* Home page showing all students */}
      <Route path="/" element={<Dashboard/>} />
      
      {/* Individual student page with their details and remarks */}
      <Route path="/user/:id" element={<StudentDetails />} />
    </Routes>
  );
}

export default App;