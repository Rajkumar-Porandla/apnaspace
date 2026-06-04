import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PropertyDetails from './pages/PropertyDetails';
import AiAssistant from './pages/AiAssistant';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Comparison from './pages/Comparison';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ErrorBoundary from './components/ErrorBoundary';

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('home'); // home, details, ai-assistant, dashboard, login, chat, comparison
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [compareList, setCompareList] = useState([]);

  const handleViewDetails = (id) => {
    setSelectedPropertyId(id);
    setCurrentTab('details');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0ECE3] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* GLOBAL NAVBAR */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* RENDER ACTIVE PAGE CONTENT */}
      <main className="flex-grow">
        {currentTab === 'home' && (
          <Home 
            onViewDetails={handleViewDetails} 
            compareList={compareList} 
            setCompareList={setCompareList} 
          />
        )}
        
        {currentTab === 'details' && (
          <PropertyDetails 
            propertyId={selectedPropertyId} 
            onBack={() => setCurrentTab('home')} 
            onSelectProperty={handleViewDetails}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'ai-assistant' && (
          <AiAssistant onViewDetails={handleViewDetails} />
        )}

        {currentTab === 'dashboard' && (
          <ErrorBoundary>
            <Dashboard 
              onViewProperty={handleViewDetails} 
              setCurrentTab={setCurrentTab}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'comparison' && (
          <Comparison 
            compareList={compareList} 
            setCompareList={setCompareList} 
            onViewDetails={handleViewDetails} 
            setCurrentTab={setCurrentTab} 
          />
        )}

        {currentTab === 'login' && (
          <Login onLoginSuccess={() => setCurrentTab(user?.role === 'admin' ? 'dashboard' : 'home')} />
        )}

        {currentTab === 'chat' && (
          <Chat />
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-6 border-t border-slate-200/50 dark:border-slate-800/40 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ApnaSpace Inc. All rights reserved.
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <MainApp />
      </ChatProvider>
    </AuthProvider>
  );
}
