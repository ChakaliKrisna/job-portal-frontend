import React, { useState, useEffect } from 'react';

// Central Configuration
const BASE_URL = "http://localhost:8080";
const TOKEN = localStorage.getItem('token'); 

const CompanyProfile = () => {
  // Core UI States
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); 
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // Allows toggling between 'overview' and 'analytics'
  
  // Enterprise request tracking state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    website: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    logoUrl: '',
    description: ''
  });

  useEffect(() => {
    fetchCompanyData();
  }, []);

  // Gracefully auto-dismiss success toasts
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/job-portal/company/my-company`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to synchronize company profile metrics');

      const data = await response.json();
      setCompany(data);
      populateForm(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data) => {
    setFormData({
      name: data.name || '',
      location: data.location || '',
      website: data.website || '',
      industry: data.industry || '',
      companySize: data.companySize || '',
      foundedYear: data.foundedYear || '',
      logoUrl: data.logoUrl || '',
      description: data.description || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (company) populateForm(company);
    setIsEditing(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); 
      setError(null);

      // FIX VERIFIED: Removed dangling quote break in the header initialization block
      const response = await fetch(`${BASE_URL}/job-portal/company/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Could not publish changes to the server');

      const updatedCompany = await response.json();
      setCompany(updatedCompany);
      populateForm(updatedCompany);
      setIsEditing(false);
      setSuccessMessage("Workspace settings successfully synced with enterprise network."); 
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false); 
    }
  };

  const formatWebsiteUrl = (url) => {
    if (!url) return '';
    return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !company) {
    return (
      <div className="flex justify-center items-center h-96 bg-slate-50/50">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  // Fallback UI Avatar string generator
  const getFallbackAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Company")}&background=4f46e5&color=fff&size=128`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-slate-50/50 min-h-screen text-slate-800 antialiased">
      
      {/* Premium Success Notification Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all animate-bounce-short">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          <p className="text-sm font-medium">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="ml-4 font-bold text-slate-400 hover:text-white">×</button>
        </div>
      )}

      {/* Modernized Error Alert Box */}
      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-800 px-4 py-3.5 rounded-xl flex items-center gap-3 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <p className="text-sm font-medium"><strong className="font-semibold">Sync Blocked:</strong> {error}</p>
        </div>
      )}

      {/* Premium Workspace Billboard Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="h-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 relative">
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-white/90 font-medium tracking-wider uppercase">
            Enterprise Operator Room
          </div>
        </div>
        
        <div className="px-6 pb-6 relative flex flex-col sm:flex-row items-center sm:items-end -mt-14 gap-5 text-center sm:text-left">
          <div className="relative">
            <img
              src={isEditing ? (formData.logoUrl || getFallbackAvatar(formData.name)) : (company?.logoUrl || getFallbackAvatar(company?.name))}
              alt={`${isEditing ? formData.name : company?.name} Brand Identity`}
              className="w-28 h-28 rounded-2xl object-cover bg-white p-2 shadow-xl border border-slate-100/80"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getFallbackAvatar(isEditing ? formData.name : company?.name);
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
                {isEditing ? (formData.name || 'New Company Group') : company?.name}
              </h1>
              <span className="self-center inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/60">Verified Hub</span>
            </div>
            <p className="text-slate-500 text-sm font-medium mt-1">
              {isEditing ? (formData.industry || 'Sector Not Declared') : (company?.industry || 'Sector Not Declared')} • <span className="text-slate-400 font-normal">{isEditing ? (formData.location || 'Remote HQ') : (company?.location || 'Remote HQ')}</span>
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm tracking-wide"
            >
              Configure Hub
            </button>
          )}
        </div>

        {/* Workspace Sub-Navigation Tab Strip */}
        {!isEditing && (
          <div className="flex px-6 border-t border-slate-100 bg-slate-50/50">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              Corporate Profile
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition-all ${activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              Talent Pools & Insights
            </button>
          </div>
        )}
      </div>

      {/* Main Workflow Switching Canvas */}
      {isEditing ? (
        /* PREMIUM DOUBLE-COLUMN EDITING MATRIX */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Modify Workspace Profile Assets</h2>
            <p className="text-xs text-slate-400 mt-0.5">Ensure information parameters match downstream recruiting compliance configurations.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Legal Entity Name *</label>
              <input
                type="text" name="name" required value={formData.name} onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Primary Operations HQ</label>
              <input
                type="text" name="location" value={formData.location} onChange={handleInputChange}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Core Domain Link URL</label>
              <input
                type="text" name="website" value={formData.website} onChange={handleInputChange}
                placeholder="e.g. company.com"
                className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Custom Brand Image Asset URL</label>
              <input
                type="url" name="logoUrl" value={formData.logoUrl} onChange={handleInputChange}
                placeholder="https://domain.com/logo.png"
                className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Macro Sector Industry Group</label>
              <input
                type="text" name="industry" value={formData.industry} onChange={handleInputChange}
                placeholder="e.g. FinTech, Artificial Intelligence"
                className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Headcount Scale</label>
                <select
                  name="companySize" value={formData.companySize} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                >
                  <option value="">Select Scale</option>
                  <option value="1-10">1-10 staff</option>
                  <option value="11-50">11-50 staff</option>
                  <option value="51-200">51-200 staff</option>
                  <option value="201-500">201-500 staff</option>
                  <option value="501+">501+ Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Corporate Inception</label>
                <input
                  type="number" name="foundedYear" value={formData.foundedYear} onChange={handleInputChange}
                  placeholder="e.g. 2018"
                  className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Corporate Pitch & Workspace Culture Description</label>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                {formData.description?.length || 0} Chars
              </span>
            </div>
            <textarea
              name="description" rows="5" value={formData.description} onChange={handleInputChange}
              placeholder="Tell top developers about your scaling trajectory, technical roadmaps, equity parameters, and corporate vision..."
              className="w-full px-4 py-3 border border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium leading-relaxed"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button" onClick={handleCancel}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition"
            >
              Discard Changes
            </button>
            <button
              type="submit" disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/10 transition"
            >
              {saving ? 'Synchronizing...' : 'Save Hub Configuration'}
            </button>
          </div>
        </form>
      ) : (
        /* CORE RECRUITER VIEW MODES */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TAB CONTENT: PROFILE DATA OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
                  <h3 className="text-base font-bold text-slate-900 mb-4 tracking-tight">Mission Statement & Culture</h3>
                  <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">
                    {company?.description || "No customized summary has been appended to this company hub registry yet. Select 'Configure Hub' to populate details."}
                  </p>
                </div>

                {/* Grid Deck for Dynamic Workspace Assets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Segment</span>
                    <span className="text-sm font-semibold text-slate-800 mt-2 block">{company?.industry || 'General Placement'}</span>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Headcount Scope</span>
                    <span className="text-sm font-semibold text-slate-800 mt-2 block">{company?.companySize ? `${company.companySize} Operators` : 'Pre-Scale Node'}</span>
                  </div>
                </div>
              </div>

              {/* SIDEBAR METADATA ANCHOR CONTAINER */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit space-y-5">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">Corporate Directory</h3>
                
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Web Domain</span>
                  {company?.website ? (
                    <a 
                      href={formatWebsiteUrl(company.website)} target="_blank" rel="noopener noreferrer" 
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1 group break-all"
                    >
                      {company.website} 
                      <span className="text-xs transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400 italic">Not Assigned</span>
                  )}
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Base Location</span>
                  <span className="text-sm text-slate-700 font-semibold">{company?.location || 'Global Distributed'}</span>
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Market Lifecycle</span>
                  <span className="text-sm text-slate-700 font-semibold">{company?.foundedYear ? `Established ${company.foundedYear}` : 'Historical Record Missing'}</span>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">System Reference ID</span>
                  <span className="text-[10px] font-mono text-slate-400 select-all bg-slate-50 border border-slate-100 p-2 rounded-lg block truncate">
                    {company?.publicId || 'SYS-STAGING-RESERVED-DATA'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* TAB CONTENT: ADVANCED ANALYTICS EMBED */}
          {activeTab === 'analytics' && (
            <div className="lg:col-span-3 space-y-6">
              
              {/* Premium Analytics Metric Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-md shadow-indigo-600/10">
                  <span className="text-xs uppercase font-bold tracking-widest text-indigo-200/80">Active Openings</span>
                  <h3 className="text-4xl font-extrabold tracking-tight mt-2">{company?.jobs?.length || 0}</h3>
                  <p className="text-xs text-indigo-100/70 mt-2.5">Live requisitions taking incoming developer apps.</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Assigned Recruiters</span>
                  <h3 className="text-4xl font-extrabold tracking-tight mt-2 text-slate-900">{company?.recruiters?.length || 1}</h3>
                  <p className="text-xs text-slate-500 mt-2.5">Allocated seats currently monitoring pipelines.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Hub Generation Date</span>
                  <h3 className="text-lg font-bold tracking-tight mt-4 text-slate-800">
                    {formatDate(company?.createdAt)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-3">Initial account framework synchronization timeline.</p>
                </div>
              </div>

              {/* Data visualizations metrics deck */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Pipeline Load Metrics</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-500">Pipeline Infrastructure Load Allocation</span>
                        <span className="text-slate-800 font-bold">{(company?.jobs?.length || 0) * 10}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-500" 
                          style={{ width: `${Math.min(((company?.jobs?.length || 0) * 10), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Index metrics dictate maximum query cache speeds for candidate sorting routines. Scaling items requires a higher hub seat allocation tier.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-3.5">Active Workspace Seat Monitors</h4>
                  <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto pr-1">
                    {company?.recruiters?.map((recruiter, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100/50">
                            {recruiter.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-slate-700 font-semibold">{recruiter}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100/60 uppercase">Active</span>
                      </div>
                    )) || (
                      <div className="py-3 text-sm text-slate-400 italic text-center">Primary Workspace Administrative Node Only</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default CompanyProfile;