
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowLeft, Tag, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../lib/supabaseClient';
import { BlogPost } from '../types';

interface BlogProps {
  initialPostId?: number | null;
}

export const Blog: React.FC<BlogProps> = ({ initialPostId }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('id', { ascending: false });

      if (data) {
        setPosts(data);
        if (initialPostId) {
          const found = data.find((p: BlogPost) => p.id === initialPostId);
          if (found) setSelectedPost(found);
        }
      }
      setLoading(false);
    };
    fetchPosts();
  }, [initialPostId]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Pagination Logic
  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const currentPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top when opening a post
  const openPost = (post: BlogPost) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedPost(post);
  };

  const closePost = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedPost(null);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-electric-yellow border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fade-in pb-20">
        <Button
          onClick={closePost}
          variant="ghost"
          className="mb-6 pl-0 hover:pl-2 transition-all gap-2 text-zinc-400 hover:text-electric-yellow"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Artigos
        </Button>

        <article>
          {/* Header Image */}
          <div className="relative w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-dark-border">
            <img
              src={selectedPost.image_url}
              alt={selectedPost.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            <div className="absolute bottom-0 left-0 p-6 md:p-10 pb-24 md:pb-28 w-full">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="bg-electric-yellow text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-yellow-500/20">
                  {selectedPost.tag}
                </span>
                <span className="flex items-center gap-1.5 text-zinc-200 text-xs font-medium bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <Calendar className="w-3.5 h-3.5" /> {selectedPost.display_date}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg max-w-4xl">
                {selectedPost.title}
              </h1>
            </div>
          </div>

          {/* White Paper Content Body */}
          <div className="relative z-10 -mt-20 mx-2 md:mx-6 bg-white rounded-3xl shadow-xl p-8 md:p-12 text-zinc-900">
            {/* Author Info */}
            <div className="flex items-center gap-4 mb-10 pb-8 border-b border-zinc-200">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 overflow-hidden">
                {selectedPost.editor_avatar_url ? (
                  <img src={selectedPost.editor_avatar_url} alt="Editor" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-zinc-700" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">{selectedPost.editor_name || 'Equipe Instalação Segura'}</p>
              </div>
            </div>

            {/* Injected HTML Content - Typography Optimized for Light Background */}
            <div
              className="prose prose-lg max-w-none prose-zinc 
              prose-headings:font-bold prose-headings:text-zinc-900 
              prose-p:text-zinc-700 prose-p:leading-relaxed
              prose-li:text-zinc-700 prose-li:marker:text-yellow-500
              prose-strong:text-yellow-600 prose-strong:font-bold
              prose-a:text-blue-600 hover:prose-a:text-blue-800"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />

            {/* Footer Tag */}
            <div className="mt-12 pt-8 border-t border-zinc-200 flex items-center gap-2">
              <Tag className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-zinc-500 font-medium">Tags: {selectedPost.tag}, NBR 5410</span>
            </div>
          </div>

          {/* Related Posts Section - Outside the white box to keep dark contrast */}
          <div className="mt-16 pt-8 px-2 md:px-4">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-electric-yellow rounded-full"></div>
              Continue Lendo
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {posts.filter(p => p.id !== selectedPost.id).slice(0, 2).map(post => (
                <div
                  key={post.id}
                  onClick={() => openPost(post)}
                  className="group cursor-pointer bg-dark-surface border border-dark-border rounded-xl p-5 flex gap-5 hover:border-electric-yellow/30 hover:bg-zinc-800/50 transition-all shadow-lg"
                >
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 group-hover:text-electric-yellow transition-colors">{post.tag}</span>
                    <h4 className="text-base font-bold text-zinc-100 group-hover:text-white leading-tight mb-2 line-clamp-2">
                      {post.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in pb-20">

      {/* Centered Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Artigos Técnicos</h2>
        <p className="text-text-secondary text-lg">Conhecimento técnico e teórico fácil de aplicar.</p>
      </div>

      {/* Grid Layout (3 items per row on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => openPost(post)}
            className="group flex flex-col bg-dark-surface border border-dark-border rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-2xl hover:shadow-electric-yellow/5 transition-all cursor-pointer h-full"
          >
            {/* Image Container */}
            <div className="h-56 relative overflow-hidden">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-surface to-transparent opacity-60"></div>

              <div className="absolute top-4 left-4">
                <span className="text-[10px] font-bold text-black bg-electric-yellow px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  {post.tag}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3 text-xs text-zinc-500">
                <Calendar className="w-3.5 h-3.5 text-electric-yellow" />
                <span>{post.display_date}</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-electric-yellow transition-colors leading-tight">
                {post.title}
              </h3>

              <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                {post.excerpt}
              </p>

              <div className="mt-auto pt-4 border-t border-dark-border flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:underline decoration-electric-yellow underline-offset-4">Ler artigo completo</span>
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-dark-border flex items-center justify-center text-zinc-400 group-hover:bg-electric-yellow group-hover:text-black group-hover:border-electric-yellow transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls (Hidden if pages <= 1) */}
      {totalPages > 1 && (
        <div className="mt-16 flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={prevPage}
            disabled={currentPage === 1}
            className="w-10 h-10 p-0 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <span className="text-sm text-zinc-400 font-medium">
            Página <span className="text-white">{currentPage}</span> de <span className="text-white">{totalPages}</span>
          </span>

          <Button
            variant="outline"
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="w-10 h-10 p-0 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};
