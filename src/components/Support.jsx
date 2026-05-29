import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const Support = () => {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupportData = async () => {
      try {
        const [categoriesRes, articlesRes] = await Promise.all([
          api.get('/support/categories'),
          api.get('/support/articles')
        ]);
        setCategories(categoriesRes);
        setArticles(articlesRes);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch support data:', error);
        setLoading(false);
      }
    };
    fetchSupportData();
  }, []);

  if (loading) return <div className="p-10 max-w-7xl mx-auto w-full flex-1">Loading support center...</div>;

  const featuredCategory = categories.find(c => c.isFeatured);
  const sideCategories = categories.filter(c => !c.isFeatured);

  return (
    <div className="p-10 max-w-7xl mx-auto w-full flex-1">
      {/* Hero Section */}
      <section className="mb-12 text-center py-12 relative overflow-hidden rounded-3xl bg-primary-container text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-secondary-container via-transparent to-transparent"></div>
        <div className="relative z-10">
          <h2 className="font-headline-lg text-headline-lg mb-4">How can we help you today?</h2>
          <p className="font-body-lg text-body-lg text-on-primary-container/80 max-w-2xl mx-auto mb-8">Search our knowledge base or browse categories below to find answers to your questions.</p>
          <div className="max-w-2xl mx-auto relative group">
            <input 
              className="w-full bg-white text-on-surface h-16 rounded-2xl pl-14 pr-6 shadow-xl border-none focus:ring-4 focus:ring-secondary/20 transition-all text-body-lg outline-none" 
              placeholder="Type keywords like 'billing', 'API', or 'teams'..." 
              type="text" 
            />
            <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-secondary text-xl"></i>
          </div>
        </div>
      </section>

      {/* Grid Categories (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* Large Feature Card */}
        {featuredCategory && (
          <div className="md:col-span-2 group relative overflow-hidden bg-white rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-secondary-container/30 cursor-pointer">
            <div className="flex flex-col h-full">
              <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                <i className={`${featuredCategory.icon} text-2xl`}></i>
              </div>
              <h3 className="font-headline-md text-headline-md mb-2">{featuredCategory.title}</h3>
              <p className="text-on-surface-variant mb-6">{featuredCategory.description}</p>
              <div className="mt-auto grid grid-cols-2 gap-4">
                {featuredCategory.links.map((link, i) => (
                  <a key={i} className="font-label-md text-label-md text-secondary hover:underline flex items-center gap-1" href={link.url}>
                    {link.title} <i className="fa-solid fa-arrow-right text-[12px]"></i>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Side Feature Cards */}
        <div className="space-y-6">
          {sideCategories.map((category) => (
            <div key={category._id} className="bg-white rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-secondary-container/30 group cursor-pointer">
              <div className="w-10 h-10 bg-surface-container-highest rounded-xl flex items-center justify-center text-secondary mb-4">
                <i className={`${category.icon} text-lg`}></i>
              </div>
              <h4 className="font-headline-md text-[18px] mb-1">{category.title}</h4>
              <p className="text-body-md text-on-surface-variant text-sm mb-4">{category.description}</p>
              <a className="font-label-md text-label-md text-secondary flex items-center gap-1 group-hover:gap-2 transition-all" href="#">View articles <i className="fa-solid fa-arrow-right text-[12px]"></i></a>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Articles & Contact Asymmetric Layout */}
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-2/3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-headline-md">Popular Articles</h3>
            <button className="text-secondary font-label-md text-label-md hover:underline cursor-pointer">View all</button>
          </div>
          <div className="space-y-3">
            {articles.map((article) => (
              <div key={article._id} className="bg-white p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:translate-x-2 transition-transform cursor-pointer group border border-outline-variant/10">
                <i className={`${article.icon} text-on-surface-variant group-hover:text-secondary transition-colors text-xl`}></i>
                <div className="flex-1">
                  <p className="font-label-md text-[15px]">{article.title}</p>
                  <p className="text-label-sm text-on-surface-variant">{article.lastUpdated} • {article.readTime}</p>
                </div>
                <i className="fa-solid fa-chevron-right text-outline-variant"></i>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Options Section */}
        <div className="lg:w-1/3">
          <div className="bg-surface-container-high rounded-[32px] p-8">
            <h3 className="font-headline-md text-headline-md mb-2">Still need help?</h3>
            <p className="text-on-surface-variant mb-8 text-body-md">Our support team is available 24/7 to help you resolve any issues or answer questions.</p>
            <div className="space-y-4">
              <button className="w-full bg-secondary text-white h-14 rounded-2xl font-label-md text-label-md flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-secondary/20 transition-all active:scale-[0.98] cursor-pointer">
                <i className="fa-solid fa-comment text-lg"></i>
                Live Chat Now
              </button>
              <button className="w-full bg-white text-secondary border-2 border-secondary/10 h-14 rounded-2xl font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-secondary/5 transition-all active:scale-[0.98] cursor-pointer">
                <i className="fa-solid fa-envelope text-lg"></i>
                Email Support
              </button>
            </div>
            
            <div className="mt-10 p-6 bg-white/50 rounded-2xl border border-white/60">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtSuV-tq_uKF2IhdHgqA2W2RqtW8gnATNyRsjUm2SDrZgsKAju9WlAGzYpXamZiOY5QOQkrVljp8rVUipYuDK_oouGUgloKbPLDk9M-Mm1cbr4jZsriOXtDx5ytTybirrjacPhukrIbcCaQ-TLiF0snpWo5kvWz_UOliwYAZt_EBWvLt7mT3Zrz7QGS479El79fe-v3kmTJ__K3VzVrwh7P2807ae-8NlL5OrcscbKk9oJnw26qleqmKJLwogR025Z101MTgTR4MuD" alt="Support agent 1" />
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7BI7YUBv_I0RSbK7v7F1KuCh32mDxLV2MuL6UUT9OPvmekZpwFz4F_GpRq6bZAxT1eRDwkN5a-9B-AcbDKFZ7AJoqozG1Kc02aO3O0TCXNM-HdTZ4TU0TqbwEUm4-odzaCNrrnD2x7BsznQot9_4WzVQZawHtEX4-TnpU_4KV37NSWTi80GP6Heu_y2Nqy_9IZB97cHPtudBhnWn8E32qSgpFJf4NUJRG7icHeaeP0Ya4HVCwlbYfJdYNNDPJq2gR3-ko7BBYiPaS" alt="Support agent 2" />
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgYZTgtE2WYmhh70P3fJIVLDVtVbyGi1J3UPg_bug-kt5oPel2BojrPKB1X9dZ-H5FkeHlclibIDFK95RrmZuv2yZ3U6dS9Ctfa2QxH-5sdlbeNChZ_GuB2gJLJ5or6loU1fAW83FCp1tR6yaR5MYsfCpxJkX3amMiBG4vnqTdY9-iGkLOu9pUotPxT6hJe5cQaTChlKaJ34AdFubCpAv6f4F4fe2_iR04GAGBXHBrjB3X2BsfwawzQ2iaL98nKmX2tfnYWhu6FgDt" alt="Support agent 3" />
                </div>
                <span className="text-label-sm text-on-surface-variant">Active support agents</span>
              </div>
              <p className="text-label-sm font-bold text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Current wait time: &lt; 2 mins
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Help */}
      <footer className="bg-surface-container py-12 px-10 mt-12 border-t border-outline-variant/10 rounded-3xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-on-surface-variant/10 rounded flex items-center justify-center">
              <i className="fa-solid fa-comments text-on-surface-variant"></i>
            </div>
            <span className="font-label-md text-label-md text-on-surface-variant">Join our Community Forum to learn from other users.</span>
          </div>
          <div className="flex gap-8">
            <a className="text-label-md text-on-surface-variant hover:text-secondary transition-colors" href="#">API Status</a>
            <a className="text-label-md text-on-surface-variant hover:text-secondary transition-colors" href="#">Changelog</a>
            <a className="text-label-md text-on-surface-variant hover:text-secondary transition-colors" href="#">System Health</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Support;
