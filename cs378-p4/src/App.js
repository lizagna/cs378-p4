import './App.css';
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { HashRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <section>
          <Routes>
            {" "}
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </section>
      </div>
    </Router>
  );
}

export default App;

/**
 * <Route path="/" element={<Dashboard />} />
 * <Route path="/login" element={<Login />} />
 * <Route path="/signup" element={<Signup />} />
 */