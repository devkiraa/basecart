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

  const handleDeleteFaq = async (id: string) => {
    await fetch(`${API_URL}/admin/cms/faqs/${id}`, { method: "DELETE", credentials: "include" });
    loadFaqs();
  };

  const handleDeleteBlog = async (id: string) => {
    await fetch(`${API_URL}/admin/cms/blogs/${id}`, { method: "DELETE", credentials: "include" });
    loadBlogs();
  };

  const handleAddFaq = async () => {
    const q = prompt("Enter FAQ question:");
    if (!q) return;
    const category = prompt("Enter category (e.g., General, Billing, Integrations):", "General");
    if (!category) return;
    
    await fetch(`${API_URL}/admin/cms/faqs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, q, status: "published" }),
      credentials: "include"
    });
    loadFaqs();
  };

  const handleAddBlog = async () => {
    const title = prompt("Enter blog article title:");
    if (!title) return;

    await fetch(`${API_URL}/admin/cms/blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status: "published" }),
      credentials: "include"
    });
    loadBlogs();
  };

  const handleAddJob = async () => {
    const title = prompt("Enter job title:");
    if (!title) return;
    const location = prompt("Enter location (e.g., Remote (Kochi), Kochi Hub):", "Remote (Kochi)");
    if (!location) return;

    await fetch(`${API_URL}/admin/cms/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, location, status: "open" }),
      credentials: "include"
    });
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
                onClick={handleAddFaq}
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
                      onClick={() => alert(`Opening FAQ editor for ID: ${faq.id}`)}
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
                onClick={handleAddBlog}
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
                      onClick={() => alert(`Editing blog: ${blog.title}`)}
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
                onClick={handleAddJob}
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
      </div>
  );
}
