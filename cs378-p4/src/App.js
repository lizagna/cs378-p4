import logo from './logo.svg';
import './App.css';
import Dashboard from "./components/Dashboard";
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
          </Routes>
        </section>
      </div>
    </Router>
  );
}

export default App;
