"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  HelpCircle, 
  BookOpen, 
  Briefcase, 
  Edit3, 
  Trash, 
  Plus, 
  Eye
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface FaqItem {
  id: string;
  category: string;
  q: string;
  status: string;
}

interface BlogItem {
  id: string;
  date: string;
  title: string;
  status: string;
}

interface JobItem {
  id: string;
  title: string;
  location: string;
  status: string;
}

export default function CmsManager() {
  const [activeTab, setActiveTab] = useState("faqs");
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);

  const loadFaqs = () => {
    fetch(`${API_URL}/admin/cms/faqs`, { credentials: "include" })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setFaqs(data); });
  };
  const loadBlogs = () => {
    fetch(`${API_URL}/admin/cms/blogs`, { credentials: "include" })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBlogs(data); });
  };
  const loadJobs = () => {
    fetch(`${API_URL}/admin/cms/jobs`, { credentials: "include" })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setJobs(data); });
  };

  useEffect(() => {
    loadFaqs();
    loadBlogs();
    loadJobs();
  }, []);

  // Modal States
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);

  const [faqForm, setFaqForm] = useState({ q: "", category: "General" });
  const [blogForm, setBlogForm] = useState({ title: "", content: "<p>Welcome to our latest platform announcement...</p>" });
  const [jobForm, setJobForm] = useState({ title: "", location: "Remote (Kochi)" });
  const [blogTab, setBlogTab] = useState<"edit" | "preview">("edit");

  const handleDeleteFaq = async (id: string) => {
    await fetch(`${API_URL}/admin/cms/faqs/${id}`, { method: "DELETE", credentials: "include" });
    loadFaqs();
  };

  const handleDeleteBlog = async (id: string) => {
    await fetch(`${API_URL}/admin/cms/blogs/${id}`, { method: "DELETE", credentials: "include" });
    loadBlogs();
  };

  const submitFaqModal = async () => {
    if (!faqForm.q.trim()) return;
    await fetch(`${API_URL}/admin/cms/faqs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: faqForm.category, q: faqForm.q, status: "published" }),
      credentials: "include"
    });
    setFaqForm({ q: "", category: "General" });
    setShowFaqModal(false);
    loadFaqs();
  };

  const submitBlogModal = async () => {
    if (!blogForm.title.trim()) return;
    await fetch(`${API_URL}/admin/cms/blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: blogForm.title, content: blogForm.content, status: "published" }),
      credentials: "include"
    });
    setBlogForm({ title: "", content: "<p>Write post content...</p>" });
    setShowBlogModal(false);
    loadBlogs();
  };

  const submitJobModal = async () => {
    if (!jobForm.title.trim()) return;
    await fetch(`${API_URL}/admin/cms/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: jobForm.title, location: jobForm.location, status: "open" }),
      credentials: "include"
    });
    setJobForm({ title: "", location: "Remote (Kochi)" });
    setShowJobModal(false);
    loadJobs();
  };

  const handleToggleJob = async (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    const newStatus = job.status === "open" ? "closed" : "open";
    await fetch(`${API_URL}/admin/cms/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
      credentials: "include"
    });
    loadJobs();
  };

  return (
    <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Content Management (CMS)</h1>
            <p className="text-sm text-slate-500 mt-1">
              Operate the landing page copy, FAQs list, platform blog archives, developer docs, and career listings.
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl select-none shrink-0 border border-slate-200/40">
            <button
              onClick={() => setActiveTab("faqs")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "faqs" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              FAQs
            </button>
            <button
              onClick={() => setActiveTab("blogs")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "blogs" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Blog
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "jobs" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Careers
            </button>
          </div>
        </div>

        {/* Tab contents */}
        {activeTab === "faqs" && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Frequently Asked Questions</h2>
              <button 
                onClick={() => setShowFaqModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add FAQ
              </button>
            </div>
            
            <div className="divide-y divide-slate-100">
              {faqs.map((faq) => (
                <div key={faq.id} className="p-6 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded">
                        {faq.category}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        faq.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"
                      }`}>
                        {faq.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{faq.q}</h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => { setFaqForm({ q: faq.q, category: faq.category }); setShowFaqModal(true); }}
                      className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Edit item"
                    >
                      <Edit3 className="w-4.5 h-4.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="p-1.5 hover:bg-red-50 text-slate-350 hover:text-red-650 rounded transition-colors"
                      title="Delete item"
                    >
                      <Trash className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "blogs" && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Marketing Blog Articles</h2>
              <button 
                onClick={() => setShowBlogModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Write Post
              </button>
            </div>
            
            <div className="divide-y divide-slate-100">
              {blogs.map((blog) => (
                <div key={blog.id} className="p-6 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                      <span>{blog.date}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold uppercase">{blog.status}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{blog.title}</h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => { setBlogForm({ title: blog.title, content: "<p>Article content details...</p>" }); setShowBlogModal(true); }}
                      className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Edit article"
                    >
                      <Edit3 className="w-4.5 h-4.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="p-1.5 hover:bg-red-50 text-slate-350 hover:text-red-650 rounded transition-colors"
                      title="Delete article"
                    >
                      <Trash className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Careers & Job Openings</h2>
              <button 
                onClick={() => setShowJobModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Post Job
              </button>
            </div>
            
            <div className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">{job.title}</h4>
                    <p className="text-xs text-slate-400 font-semibold">{job.location}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleToggleJob(job.id)}
                      className={`px-3 py-1.5 border text-xs font-bold rounded-lg transition-colors ${
                        job.status === "open" 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      {job.status === "open" ? "Active (Open)" : "Inactive"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Add FAQ */}
        {showFaqModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add / Edit FAQ</h3>
              <div className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="text-slate-500 block mb-1">Category</label>
                  <select
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  >
                    <option value="General">General</option>
                    <option value="Billing">Billing</option>
                    <option value="Integrations">Integrations</option>
                    <option value="Shipping">Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Question</label>
                  <input
                    type="text"
                    value={faqForm.q}
                    onChange={(e) => setFaqForm({ ...faqForm, q: e.target.value })}
                    placeholder="e.g. How do I configure custom payment gateways?"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowFaqModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button onClick={submitFaqModal} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">Save FAQ</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Rich Text Blog Post */}
        {showBlogModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Write / Edit Blog Post</h3>
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button onClick={() => setBlogTab("edit")} className={`px-3 py-1 rounded-md font-bold ${blogTab === "edit" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>Edit HTML</button>
                  <button onClick={() => setBlogTab("preview")} className={`px-3 py-1 rounded-md font-bold ${blogTab === "preview" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>Live Preview</button>
                </div>
              </div>
              <div className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="text-slate-500 block mb-1">Article Title</label>
                  <input
                    type="text"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    placeholder="Title of blog post"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Content ({blogTab === "edit" ? "HTML Markup" : "Visual Preview"})</label>
                  {blogTab === "edit" ? (
                    <textarea
                      rows={8}
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      className="w-full p-3 border rounded-xl font-mono text-xs bg-slate-900 text-emerald-400"
                    />
                  ) : (
                    <div className="p-4 border rounded-xl bg-slate-50 min-h-[200px] prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: blogForm.content }} />
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowBlogModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button onClick={submitBlogModal} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">Publish Post</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Job */}
        {showJobModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create Career Posting</h3>
              <div className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="text-slate-500 block mb-1">Role Title</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g. Senior Cloudflare Worker Engineer"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="e.g. Remote (Kochi, Kerala)"
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowJobModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                <button onClick={submitJobModal} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">Post Opening</button>
              </div>
            </div>
          </div>
        )}

      </div>
  );
}
