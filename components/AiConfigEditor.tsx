import React, { useState } from 'react';
import { AiConfig, AI_MODELS } from '../types';
import { validateApiKey } from '../services/geminiService';
import { Key, Wand2, ShieldCheck, ShieldAlert, Zap, TrendingUp, Coins } from 'lucide-react';

interface AiConfigEditorProps {
  config: AiConfig;
  onChange: (config: AiConfig) => void;
}

export const AiConfigEditor: React.FC<AiConfigEditorProps> = ({ config, onChange }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const handleChange = (field: keyof AiConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const checkKey = async () => {
    setIsValidating(true);
    setValidationStatus('idle');
    const isValid = await validateApiKey(config.apiKey);
    setValidationStatus(isValid ? 'valid' : 'invalid');
    setIsValidating(false);
  };

  const remainingTokens = Math.max(0, config.monthlyTokenBudget - config.tokenUsage.total);
  const usagePercent = Math.min(100, (config.tokenUsage.total / config.monthlyTokenBudget) * 100);

  return (
    <div className="space-y-8">
      {/* API Key Section */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-600" />
          Gemini API Configuration
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Your API key is stored locally and used to generate intelligent responses for open-ended questions.
        </p>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">API Key</label>
          <div className="flex gap-2">
            <input 
              type="password" 
              value={config.apiKey}
              onChange={(e) => {
                handleChange('apiKey', e.target.value);
                setValidationStatus('idle');
              }}
              placeholder="AIzaSy..."
              className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border font-mono"
            />
            <button
              onClick={checkKey}
              disabled={isValidating || !config.apiKey}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isValidating ? 'Checking...' : 'Validate'}
            </button>
          </div>
          
          {validationStatus === 'valid' && (
            <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
              <ShieldCheck className="w-4 h-4" /> API Key is valid and ready to use.
            </p>
          )}
          {validationStatus === 'invalid' && (
            <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
              <ShieldAlert className="w-4 h-4" /> Invalid API Key. Please check permissions.
            </p>
          )}
        </div>
      </section>

      {/* Token Usage & Budget */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-600" />
            Token Usage & Budget
          </h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Real-time Updates</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
             <div className="text-sm text-slate-500 mb-1">Tokens Available</div>
             <div className="text-2xl font-bold text-slate-900">{remainingTokens.toLocaleString()}</div>
             <div className="text-xs text-slate-400 mt-1">of {config.monthlyTokenBudget.toLocaleString()} monthly limit</div>
             
             <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
                <div 
                  className={`h-1.5 rounded-full ${usagePercent > 90 ? 'bg-red-500' : 'bg-green-500'}`} 
                  style={{ width: `${usagePercent}%` }}
                ></div>
             </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-500 mb-1">Total Usage</div>
            <div className="text-2xl font-bold text-indigo-600">{config.tokenUsage.total.toLocaleString()}</div>
            <div className="flex gap-3 mt-2 text-xs text-slate-500">
               <span>Input: {config.tokenUsage.input.toLocaleString()}</span>
               <span>Output: {config.tokenUsage.output.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Token Budget Limit</label>
           <p className="text-xs text-slate-500 mb-2">Set a simulated limit to track your remaining tokens.</p>
           <input 
             type="number"
             value={config.monthlyTokenBudget}
             onChange={(e) => handleChange('monthlyTokenBudget', parseInt(e.target.value) || 0)}
             className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
           />
        </div>
      </section>

      {/* Model Selection */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
         <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          Model Selection
        </h3>

        <div className="space-y-4">
           {AI_MODELS.map((model) => (
             <label 
               key={model.id}
               className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                 config.selectedModel === model.id 
                 ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                 : 'border-slate-200 hover:bg-slate-50'
               }`}
             >
                <input 
                  type="radio"
                  name="model"
                  value={model.id}
                  checked={config.selectedModel === model.id}
                  onChange={() => handleChange('selectedModel', model.id)}
                  className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <div className="ml-3 flex-1">
                   <div className="flex justify-between">
                     <span className={`block text-sm font-medium ${config.selectedModel === model.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                       {model.name}
                     </span>
                     <span className="text-xs font-mono text-slate-500">{model.costDesc}</span>
                   </div>
                   <p className={`mt-1 text-xs ${config.selectedModel === model.id ? 'text-indigo-700' : 'text-slate-500'}`}>
                      Estimated cost per 1M tokens: ${model.inputCostPer1M.toFixed(2)} input / ${model.outputCostPer1M.toFixed(2)} output
                   </p>
                </div>
             </label>
           ))}
        </div>
      </section>

      {/* Personality Section */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-indigo-600" />
          AI Personality & Behavior
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Base System Instruction</label>
            <p className="text-xs text-slate-500 mb-2">How should the AI behave when writing cover letters or answering questions?</p>
            <textarea 
              value={config.personality}
              onChange={(e) => handleChange('personality', e.target.value)}
              rows={3}
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tone of Voice</label>
              <div className="space-y-2">
                {['professional', 'enthusiastic', 'concise'].map((tone) => (
                  <label key={tone} className="flex items-center">
                    <input
                      type="radio"
                      name="tone"
                      checked={config.tone === tone}
                      onChange={() => handleChange('tone', tone)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-slate-700 capitalize">{tone}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Response Length</label>
              <div className="space-y-2">
                {['short', 'medium', 'long'].map((len) => (
                  <label key={len} className="flex items-center">
                    <input
                      type="radio"
                      name="length"
                      checked={config.responseLength === len}
                      onChange={() => handleChange('responseLength', len)}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-slate-700 capitalize">{len}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};