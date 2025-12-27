import React from 'react';
import { Settings, User, Cpu, FileText, CheckCircle } from 'lucide-react';

interface SettingsLayoutProps {
  activeTab: 'profile' | 'ai' | 'general';
  onTabChange: (tab: 'profile' | 'ai' | 'general') => void;
  children: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <CheckCircle className="w-6 h-6" />
            <span>AutoFill AI</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Chrome Extension Settings</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => onTabChange('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profile' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <User className="w-5 h-5" />
            My Profile
          </button>
          
          <button
            onClick={() => onTabChange('ai')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'ai' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-5 h-5" />
            AI & Prompts
          </button>

          <button
            onClick={() => onTabChange('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'general' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            General Settings
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-md text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">Status</p>
            <p className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Extension Active
            </p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {activeTab === 'profile' && 'Personal Information'}
            {activeTab === 'ai' && 'AI Configuration'}
            {activeTab === 'general' && 'General Settings'}
          </h2>
          <div className="text-sm text-slate-500">
            Changes save automatically
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};