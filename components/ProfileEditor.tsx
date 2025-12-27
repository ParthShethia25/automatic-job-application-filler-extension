import React, { useState } from 'react';
import { UserProfile, Experience, CustomField, Resume } from '../types';
import { Plus, Trash2, Check, FileText, Briefcase, GraduationCap, User, ListPlus, Edit2 } from 'lucide-react';

interface ProfileEditorProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

type Tab = 'basic' | 'resume' | 'experience' | 'custom';

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onChange }) => {
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);

  const handleChange = (field: keyof UserProfile, value: any) => {
    onChange({ ...profile, [field]: value });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(s => s.trim());
    handleChange('skills', skills);
  };

  // --- Resume Logic ---
  const addResume = () => {
    const newResume: Resume = {
      id: Date.now().toString(),
      name: `Resume ${profile.resumes.length + 1}`,
      content: '',
      isActive: profile.resumes.length === 0 // Make active if it's the first one
    };
    handleChange('resumes', [...profile.resumes, newResume]);
    setEditingResumeId(newResume.id);
  };

  const updateResume = (id: string, field: keyof Resume, value: any) => {
    const updated = profile.resumes.map(r => r.id === id ? { ...r, [field]: value } : r);
    handleChange('resumes', updated);
  };

  const setActiveResume = (id: string) => {
    const updated = profile.resumes.map(r => ({ ...r, isActive: r.id === id }));
    handleChange('resumes', updated);
  };

  const deleteResume = (id: string) => {
    handleChange('resumes', profile.resumes.filter(r => r.id !== id));
    if (editingResumeId === id) setEditingResumeId(null);
  };

  // --- Experience Logic ---
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      description: '',
      current: false
    };
    onChange({ ...profile, experience: [newExp, ...profile.experience] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    const newExp = profile.experience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    onChange({ ...profile, experience: newExp });
  };

  const removeExperience = (id: string) => {
    onChange({ ...profile, experience: profile.experience.filter(e => e.id !== id) });
  };

  // --- Custom Field Logic ---
  const addCustomField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      label: '',
      value: ''
    };
    onChange({ ...profile, customFields: [...profile.customFields, newField] });
  };

  const updateCustomField = (id: string, field: keyof CustomField, value: string) => {
    const newFields = profile.customFields.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    );
    onChange({ ...profile, customFields: newFields });
  };

  const removeCustomField = (id: string) => {
    onChange({ ...profile, customFields: profile.customFields.filter(f => f.id !== id) });
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation for Profile Sections */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('basic')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === 'basic' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <User className="w-4 h-4" /> Basic Info
        </button>
        <button 
          onClick={() => setActiveTab('resume')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === 'resume' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <FileText className="w-4 h-4" /> Resumes
        </button>
        <button 
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === 'experience' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Briefcase className="w-4 h-4" /> Experience
        </button>
        <button 
          onClick={() => setActiveTab('custom')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === 'custom' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <ListPlus className="w-4 h-4" /> Custom Data
        </button>
      </div>

      {/* --- BASIC INFO TAB --- */}
      {activeTab === 'basic' && (
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Contact & Identity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">First Name</label>
              <input 
                type="text" 
                value={profile.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Last Name</label>
              <input 
                type="text" 
                value={profile.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Email</label>
              <input 
                type="email" 
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Phone</label>
              <input 
                type="tel" 
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Location</label>
              <input 
                type="text" 
                value={profile.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g. Bangalore, India"
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">LinkedIn URL</label>
              <input 
                type="url" 
                value={profile.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Portfolio URL</label>
              <input 
                type="url" 
                value={profile.portfolio}
                onChange={(e) => handleChange('portfolio', e.target.value)}
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        </section>
      )}

      {/* --- RESUME TAB --- */}
      {activeTab === 'resume' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-lg font-medium text-slate-900">Manage Resumes</h3>
              <p className="text-sm text-slate-500">Paste your resume text here. The AI will parse this to answer complex questions.</p>
            </div>
            <button 
              onClick={addResume}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add Resume
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Resume List */}
            <div className="md:col-span-1 space-y-3">
               {profile.resumes.length === 0 && (
                 <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                   No resumes added yet.
                 </div>
               )}
               {profile.resumes.map(resume => (
                 <div 
                   key={resume.id} 
                   onClick={() => setEditingResumeId(resume.id)}
                   className={`cursor-pointer p-4 rounded-lg border transition-all ${
                     editingResumeId === resume.id 
                       ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50' 
                       : 'border-slate-200 bg-white hover:border-indigo-300'
                   }`}
                 >
                    <div className="flex justify-between items-start mb-2">
                       <span className="font-medium text-slate-900 truncate">{resume.name}</span>
                       {resume.isActive && (
                         <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                           Active
                         </span>
                       )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {resume.content ? `${resume.content.substring(0, 40)}...` : 'Empty content'}
                    </p>
                 </div>
               ))}
            </div>

            {/* Resume Editor */}
            <div className="md:col-span-2">
              {editingResumeId ? (
                (() => {
                  const resume = profile.resumes.find(r => r.id === editingResumeId);
                  if (!resume) return null;
                  return (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                       <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                          <input 
                             type="text" 
                             value={resume.name}
                             onChange={(e) => updateResume(resume.id, 'name', e.target.value)}
                             className="bg-transparent font-medium text-slate-900 border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none px-1"
                          />
                          <div className="flex gap-2">
                             {!resume.isActive && (
                               <button 
                                 onClick={() => setActiveResume(resume.id)}
                                 className="text-xs font-medium text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-md border border-slate-300 hover:border-indigo-300 bg-white transition-colors"
                               >
                                 Set as Active
                               </button>
                             )}
                             <button 
                               onClick={() => deleteResume(resume.id)}
                               className="text-slate-400 hover:text-red-500 p-1.5"
                               title="Delete Resume"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                       <textarea 
                         value={resume.content}
                         onChange={(e) => updateResume(resume.id, 'content', e.target.value)}
                         placeholder="Paste your full resume text here..."
                         className="flex-1 p-4 w-full resize-none focus:outline-none text-sm leading-relaxed text-slate-700"
                       />
                       <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-b-xl text-right text-xs text-slate-400">
                          {resume.content.length} characters
                       </div>
                    </div>
                  );
                })()
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-8">
                   <FileText className="w-12 h-12 mb-2 opacity-50" />
                   <p>Select a resume to edit or create a new one.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- EXPERIENCE TAB --- */}
      {activeTab === 'experience' && (
        <div className="space-y-6 animate-in fade-in">
           {/* Professional Summary */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Professional Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Current Job Title</label>
                <input 
                  type="text" 
                  value={profile.currentTitle}
                  onChange={(e) => handleChange('currentTitle', e.target.value)}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Years of Experience</label>
                <input 
                  type="number" 
                  value={profile.yearsOfExperience}
                  onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-slate-50 focus:bg-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Skills (Comma separated)</label>
                <input 
                  type="text" 
                  value={profile.skills.join(', ')}
                  onChange={handleSkillsChange}
                  placeholder="React, TypeScript, Node.js..."
                  className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
          </section>

          {/* Job History */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-900">Work History</h3>
              <button 
                onClick={addExperience}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Job
              </button>
            </div>

            <div className="space-y-4">
              {profile.experience.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4 italic">No experience added manually. The AI can also use your Resume text.</p>
              )}
              {profile.experience.map((exp) => (
                <div key={exp.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 relative group hover:bg-white transition-colors">
                  <button 
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      className="rounded-md border-slate-300 text-sm p-2 border focus:ring-indigo-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                      className="rounded-md border-slate-300 text-sm p-2 border focus:ring-indigo-500"
                    />
                    <textarea 
                      placeholder="Brief description of role..."
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      className="col-span-2 rounded-md border-slate-300 text-sm p-2 border h-16 resize-none focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* --- CUSTOM DATA TAB --- */}
      {activeTab === 'custom' && (
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
               <h3 className="text-lg font-medium text-slate-900">Custom Fields</h3>
               <p className="text-sm text-slate-500">Define specific answers for questions the AI might struggle to infer.</p>
            </div>
            <button 
              onClick={addCustomField}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Field
            </button>
          </div>

          <div className="space-y-3">
            {profile.customFields.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8 italic border-2 border-dashed border-slate-100 rounded-lg">
                No custom fields added. <br/> Examples: "Visa Status", "Joining Date", "Relocation Preference"
              </p>
            )}
            {profile.customFields.map((field) => (
              <div key={field.id} className="flex gap-3 items-center group">
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Label (e.g. Visa Status)"
                    value={field.label}
                    onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                    className="w-full rounded-md border-slate-300 text-sm p-2 border bg-slate-50 focus:bg-white focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-[2]">
                  <input 
                    type="text" 
                    placeholder="Value (e.g. Authorized to work)"
                    value={field.value}
                    onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                    className="w-full rounded-md border-slate-300 text-sm p-2 border bg-slate-50 focus:bg-white focus:ring-indigo-500"
                  />
                </div>
                <button 
                  onClick={() => removeCustomField(field.id)}
                  className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};