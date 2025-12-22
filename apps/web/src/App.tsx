import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import DragDrop from './pages/DragDrop';

function App() {
  return (
    <BrowserRouter>
      <nav className="flex gap-3 p-4">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/dragdrop">Drag & Drop</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dragdrop" element={<DragDrop />} />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
