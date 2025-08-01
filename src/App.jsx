import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DrawingBoard from './pages/DrawingBoard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<DrawingBoard />} />
      </Routes>
    </Router>
  );
}

export default App;