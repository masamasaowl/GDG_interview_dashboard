import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StudentDetails from './components/StudentDetails';

function App() {
  return (
    <Routes>

      <Route path="/" element={<Dashboard/>} />
      
      <Route path="/user/:id" element={<StudentDetails />} />

    </Routes>
  );
}

export default App;