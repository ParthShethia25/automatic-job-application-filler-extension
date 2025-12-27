import React, { useState, useEffect } from 'react';
import { UserProfile, AiConfig, DetectedField } from '../types';
import { generateAnswer } from '../services/geminiService';
import { Loader2, Check, AlertCircle, Wand2, Coins, Globe, Settings as SettingsIcon, RefreshCw } from 'lucide-react';

declare const chrome: any;

interface PopupSimulatorProps {
  profile: UserProfile;
  aiConfig: AiConfig;
  onClose: () => void;
  onUpdateUsage: (usage: { input: number; output: number; total: number }) => void;
}

export const PopupSimulator: React.FC<PopupSimulatorProps> = ({ profile, aiConfig, onClose, onUpdateUsage }) => {
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [status, setStatus] = useState<'scanning' | 'ready' | 'filling' | 'complete' | 'error'>('scanning');
  const [errorMessage, setErrorMessage] = useState('');
  const [fillProgress, setFillProgress] = useState(0);
  const [sessionUsage, setSessionUsage] = useState({ total: 0 });
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isExtensionEnvironment, setIsExtensionEnvironment] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      setIsExtensionEnvironment(true);
      scanRealPage();
    } else {
      setIsExtensionEnvironment(false);
      setStatus('ready'); 
    }
  }, []);

  const openSettings = () => {
    if (chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      console.log("Not in extension mode");
    }
  };

  const handleRefreshPage = () => {
     if (typeof chrome !== 'undefined' && chrome.tabs) {
         chrome.tabs.reload();
         window.close();
     }
  };

  const scanRealPage = async () => {
    setStatus('scanning');
    setErrorMessage('');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
          setErrorMessage("No active tab found.");
          setStatus('error');
          return;
      }
      setCurrentUrl(tab.url || '');

      // Add a small delay for retry logic
      chrome.tabs.sendMessage(tab.id, { action: "SCAN_PAGE" }, (response: any) => {
        if (chrome.runtime.lastError) {
          console.warn("Scan Error:", chrome.runtime.lastError.message);
          setErrorMessage("Extension ready. Please refresh this page to start.");
          setStatus('error');
          return;
        }
        
        if (response && response.fields) {
          const rawFields = response.fields;
          const processedFields = rawFields.map((f: any) => {
            let val = '';
            const cleanName = f.name.toLowerCase().replace(/\*/g, '').trim();
            
            // Match Logic: Try to find exact matches in structured profile first
            if (['first name', 'firstname'].includes(cleanName)) val = profile.firstName;
            else if (['last name', 'lastname'].includes(cleanName)) val = profile.lastName;
            else if (['full name', 'fullname', 'name'].includes(cleanName)) val = `${profile.firstName} ${profile.lastName}`;
            else if (cleanName.includes('email') || cleanName === 'e-mail') val = profile.email;
            else if (cleanName.includes('phone') || cleanName.includes('mobile')) val = profile.phone;
            else if (cleanName.includes('linkedin')) val = profile.linkedin;
            else if (cleanName.includes('portfolio') || cleanName.includes('website')) val = profile.portfolio;
            else if (['location', 'city', 'address', 'current location'].includes(cleanName)) val = profile.location;
            else if (cleanName.includes('salary') || cleanName.includes('expected salary')) val = profile.expectedSalary;
            else if (cleanName.includes('job title')) val = profile.currentTitle;
            else if (cleanName.includes('company') && !cleanName.includes('name')) val = profile.experience[0]?.company || '';

            if (!val) {
                const customMatch = profile.customFields.find(cf => cleanName.includes(cf.label.toLowerCase()));
                if (customMatch) val = customMatch.value;
            }

            return { 
                ...f, 
                confidence: val ? 1.0 : 0, 
                predictedValue: val 
            };
          });

          setDetectedFields(processedFields);
          setStatus('ready');
        } else {
           setStatus('ready');
        }
      });
    } catch (e) {
      console.error("Scan exception", e);
      setErrorMessage("Could not scan page.");
      setStatus('error');
    }
  };

  const handleAutoFill = async () => {
    setStatus('filling');
    setFillProgress(0);
    let sessionTotalTokens = 0;
    
    const [tab] = isExtensionEnvironment 
      ? await chrome.tabs.query({ active: true, currentWindow: true }) 
      : [{ id: 0 }];

    const newFields = [...detectedFields];
    const total = newFields.length;
    
    // Check if we have an active resume to use as fallback
    const hasActiveResume = profile.resumes.some(r => r.isActive && r.content.length > 5);

    for (let i = 0; i < total; i++) {
      const field = newFields[i];
      // Skip if already filled on the page (simple check)
      if (field.currentValue && field.currentValue.length > 2) {
          // skip
      }

      // Determine if we should use AI.
      // Logic: 
      // 1. If it's a textarea, always try AI if empty.
      // 2. If we have an active resume, try AI for ANY field that is empty (to extract Phone, LinkedIn, etc. from resume text).
      const shouldTryAi = !field.predictedValue && (
          field.type === 'textarea' || 
          (hasActiveResume && field.type === 'text') ||
          (hasActiveResume && field.type === 'url') ||
          (hasActiveResume && field.type === 'tel')
      );

      if (shouldTryAi) {
        if (aiConfig.apiKey) {
          try {
            // Provide a hint if it's a short field to force extraction
            const fieldHint = field.type !== 'textarea' ? "Extract exact value" : "Answer based on profile";
            const result = await generateAnswer(`${field.name} (${fieldHint})`, profile, aiConfig, `URL: ${currentUrl}`);
            
            if (result.text && result.text !== "ERROR" && result.text !== "[MISSING]") {
                newFields[i].predictedValue = result.text;
                newFields[i].isAiGenerated = true;
                if (result.usage) {
                   sessionTotalTokens += result.usage.total;
                   setSessionUsage({ total: sessionTotalTokens });
                   onUpdateUsage(result.usage);
                }
            }
          } catch (e) { /* ignore */ }
        }
      }

      if (newFields[i].predictedValue && isExtensionEnvironment && tab.id) {
         chrome.tabs.sendMessage(tab.id, { 
             action: "FILL_FIELD", 
             id: field.id, 
             value: newFields[i].predictedValue 
         });
      }

      setFillProgress(Math.round(((i + 1) / total) * 100));
      setDetectedFields([...newFields]);
      await new Promise(r => setTimeout(r, 50));
    }
    setStatus('complete');
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
        {/* Header */}
        <div className="bg-indigo-600 px-4 py-3 text-white flex items-center justify-between shadow-md z-10 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg">AutoFill AI</h2>
            {status === 'complete' && <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">Done</span>}
          </div>
          <button onClick={openSettings} className="p-1 hover:bg-indigo-700 rounded transition-colors" title="Open Settings">
             <SettingsIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Info Bar */}
        <div className="bg-white px-4 py-2 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 truncate" style={{maxWidth: '70%'}}>
             <Globe className="w-3 h-3 text-slate-400" />
             <span className="truncate text-xs text-slate-500 font-medium">
               {currentUrl ? new URL(currentUrl).hostname : 'No active page'}
             </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
             <Coins className="w-3 h-3 text-indigo-600" />
             <span>{sessionUsage.total}</span>
          </div>
        </div>

        {/* Content Area - Uses Flex to fill space */}
        <div className="flex-1 overflow-y-auto p-3 relative bg-slate-50">
          {status === 'scanning' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p>Scanning page...</p>
            </div>
          )}

          {status === 'error' && (
             <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                <p className="text-slate-800 font-medium mb-1">Connection Issue</p>
                <p className="text-slate-500 text-sm mb-4 max-w-xs mx-auto">{errorMessage}</p>
                {errorMessage.includes("refresh") && (
                    <button 
                        onClick={handleRefreshPage}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh Page
                    </button>
                )}
             </div>
          )}

          {status === 'ready' && detectedFields.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-800 font-medium mb-1">No Fields Found</p>
                <p className="text-slate-500 text-sm mb-4">We couldn't detect any compatible form fields on this page.</p>
                <div className="flex justify-center gap-2">
                    <button onClick={scanRealPage} className="text-indigo-600 text-sm font-medium border border-indigo-200 px-4 py-2 rounded hover:bg-indigo-50">Retry Scan</button>
                </div>
             </div>
          )}

          {(status === 'ready' || status === 'filling' || status === 'complete') && detectedFields.length > 0 && (
            <div className="space-y-3">
              <div className="px-1"><span className="text-xs font-semibold text-slate-500 uppercase">Detected Fields ({detectedFields.length})</span></div>
              {detectedFields.map((field) => (
                <div key={field.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-800 text-sm truncate w-full pr-2" title={field.name}>{field.name}</span>
                    {field.isAiGenerated && <Wand2 className="w-3 h-3 text-purple-800 shrink-0" />}
                  </div>
                  
                  {field.predictedValue ? (
                    <div className={`text-xs p-2 rounded border break-all ${
                      field.isAiGenerated ? 'bg-purple-50 text-purple-900 border-purple-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                    }`}>
                       {field.type === 'textarea' 
                         ? (field.predictedValue.length > 60 ? field.predictedValue.substring(0, 60) + '...' : field.predictedValue)
                         : field.predictedValue}
                    </div>
                  ) : (
                     <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 p-2 rounded border border-slate-100 italic">
                        <span>Empty (Will Auto-Fill)</span>
                     </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          {status === 'ready' && detectedFields.length > 0 && (
            <button 
              onClick={handleAutoFill}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow-md flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Auto-Fill Now
            </button>
          )}
          {status === 'filling' && (
             <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${fillProgress}%` }}></div>
             </div>
          )}
          {status === 'complete' && (
             <button onClick={onClose} className="w-full bg-slate-900 text-white py-2 rounded-lg">Close</button>
          )}
        </div>
    </div>
  );
};