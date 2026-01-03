import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import RulesTemplates from './pages/RulesTemplates';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import StatsPage from './pages/StatsPage';
import HistoryPage from './pages/HistoryPage';
import BottomTabBar from './components/BottomTabBar';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rules" element={<RulesTemplates />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
          <BottomTabBar />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;

