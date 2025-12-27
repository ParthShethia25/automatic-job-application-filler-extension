import React, { useState, useEffect } from 'react';
import { SettingsLayout } from './components/SettingsLayout';
import { ProfileEditor } from './components/ProfileEditor';
import { AiConfigEditor } from './components/AiConfigEditor';
import { PopupSimulator } from './components/PopupSimulator'; 
import { UserProfile, AiConfig } from './types';
import { loadProfile, saveProfile, loadAiConfig, saveAiConfig } from './services/storageService';
import { Trash2, Save } from 'lucide-react';

const App: React.FC = () => {
  const [isPopupMode, setIsPopupMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'general'>('profile');
  const [profile, setProfile] = useState<UserProfile>(loadProfile());
  const [aiConfig, setAiConfig] = useState<AiConfig>(loadAiConfig());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Detect mode (Popup vs Full Tab)
  useEffect(() => {
    // Check window width. The popup is restricted to ~800px max, usually we set it to 400px.
    // If width is larger than 500px, we assume it's the Options page/Full tab.
    if (window.innerWidth > 500) {
      setIsPopupMode(false);
      // Override the fixed CSS dimensions for the full page view
      document.body.style.width = '100vw';
      document.body.style.height = '100vh';
      document.body.style.overflow = 'auto'; // Re-enable scrolling for dashboard
    } else {
      setIsPopupMode(true);
      // Ensure popup defaults are enforced
      document.body.style.width = '400px';
      document.body.style.height = '600px';
      document.body.style.overflow = 'hidden';
    }
  }, []);

  // Auto-save effect
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveProfile(profile);
      saveAiConfig(aiConfig);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [profile, aiConfig]);

  const handleClearData = () => {
    if (confirm("Are you sure? This will delete all your data.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleUpdateUsage = (usage: { input: number; output: number; total: number }) => {
    setAiConfig(prev => ({
      ...prev,
      tokenUsage: {
        input: prev.tokenUsage.input + usage.input,
        output: prev.tokenUsage.output + usage.output,
        total: prev.tokenUsage.total + usage.total
      }
    }));
  };

  // RENDER POPUP INTERFACE
  if (isPopupMode) {
    return (
      <PopupSimulator 
        profile={profile} 
        aiConfig={aiConfig} 
        onClose={() => window.close()} 
        onUpdateUsage={handleUpdateUsage}
      />
    );
  }

  // RENDER FULL DASHBOARD
  return (
    <div className="text-slate-900 font-sans h-full">
      <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="relative">
          {saveStatus === 'saving' && (
             <span className="absolute -top-10 right-0 text-xs text-slate-400 flex items-center gap-1 animate-pulse">
               <Save className="w-3 h-3" /> Saving...
             </span>
          )}
          {saveStatus === 'saved' && (
             <span className="absolute -top-10 right-0 text-xs text-green-600 flex items-center gap-1">
               <Save className="w-3 h-3" /> Saved
             </span>
          )}

          {activeTab === 'profile' && (
            <ProfileEditor profile={profile} onChange={setProfile} />
          )}

          {activeTab === 'ai' && (
            <AiConfigEditor config={aiConfig} onChange={setAiConfig} />
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Data Management</h3>
                <p className="text-sm text-slate-500 mb-4">
                  All data is stored locally. Clear data to reset everything.
                </p>
                <button 
                  onClick={handleClearData}
                  className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </button>
              </section>
              
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="text-lg font-medium text-slate-900 mb-4">Extension Mode</h3>
                 <p className="text-sm text-slate-600 mb-4">
                   To use the auto-filler, navigate to a job application page and click the extension icon in your browser toolbar.
                 </p>
              </section>
            </div>
          )}
        </div>
      </SettingsLayout>
    </div>
  );
};

export default App;