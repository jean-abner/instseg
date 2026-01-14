
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft, Tag, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../lib/supabaseClient';
import { BlogPost } from '../types';


export const Blog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        if (id) {
          const found = data.find((p: BlogPost) => p.id === parseInt(id));
          if (found) setSelectedPost(found);
        } else {
          setSelectedPost(null);
        }
      }
      setLoading(false);
    };
    fetchPosts();
  }, [id]);

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
    navigate(`/blog/${post.id}`);
  };

  const closePost = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/blog');
  };

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPost && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedPost]);

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6 flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-electric-yellow border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const DEFAULT_POST_IMAGE = 'https://images.unsplash.com/photo-1621905251189-fc015acafd31?q=80&w=2070&auto=format&fit=crop';

  if (selectedPost) {
    return (
      <div className="bg-white text-zinc-900 animate-fade-in min-h-screen flex flex-col">
        <div className="w-full">
          {/* Back Button */}


          <article className="px-4 max-w-4xl mx-auto pb-32 pt-12">
            {/* Tag Section */}
            {(selectedPost.tags2 || selectedPost.tag) && (
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {selectedPost.tags2 ? (
                  selectedPost.tags2.split(',').map((tag, index) => (
                    <span key={index} className="bg-electric-yellow text-black text-xs font-bold px-4 py-2 uppercase tracking-wider rounded-[10px]">
                      {tag.trim()}
                    </span>
                  ))
                ) : (
                  <span className="bg-electric-yellow text-black text-xs font-bold px-4 py-2 uppercase tracking-wider rounded-[10px]">
                    {selectedPost.tag}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-zinc-900 text-center leading-tight mb-6">
              {selectedPost.title}
            </h1>

            {/* Metadata */}
            <div className="flex justify-center items-center gap-6 mb-10 text-sm border-b border-zinc-200 pb-10">
              <div className="flex items-center gap-2 text-zinc-600">
                <User className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold">{selectedPost.editor_name || 'Instalação Segura'}</span>
              </div>
              <span className="text-zinc-300">•</span>
              <div className="flex items-center gap-2 text-zinc-600">
                <Calendar className="w-4 h-4 text-yellow-600" />
                <span>{selectedPost.display_date}</span>
              </div>
            </div>

            {/* Featured Image - Full Size, No Crop */}
            <div className="w-full mb-12 shadow-xl rounded-2xl overflow-hidden bg-zinc-100">
              <img
                src={selectedPost.image_url || DEFAULT_POST_IMAGE}
                alt={selectedPost.title}
                className="w-full h-auto shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_POST_IMAGE;
                }}
              />
            </div>

            {/* Content Body - Light Background, Dark Text */}
            <div className="w-full">
              {/* Article Content with Light Theme Typography */}
              <div
                className="prose prose-lg max-w-none prose-zinc
                prose-headings:font-bold prose-headings:text-zinc-900 prose-headings:mt-12 prose-headings:mb-6
                prose-p:text-zinc-800 prose-p:leading-relaxed prose-p:mb-6
                prose-li:text-zinc-800 prose-li:marker:text-yellow-600
                prose-strong:text-yellow-700 prose-strong:font-bold
                prose-a:text-yellow-700 hover:prose-a:text-yellow-800
                prose-ul:my-6 prose-ol:my-6
                prose-img:rounded-xl prose-img:my-8 prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />

              {/* Footer Tag */}
              <div className="mt-16 pt-8 border-t border-zinc-200 flex items-center gap-2">
                <Tag className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-zinc-500 font-medium">Tags: {selectedPost.tag}, NBR 5410</span>
              </div>
            </div>

            {/* Related Posts Section (Darker contrast section) */}
            <div className="mt-20 pt-16 border-t border-zinc-200">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-electric-yellow rounded-full"></div>
                  Continue Lendo
                </h3>
                <Button
                  onClick={closePost}
                  variant="ghost"
                  className="pl-0 hover:pl-2 transition-all gap-2 text-zinc-900 font-bold hover:text-black hover:bg-zinc-100"
                >
                  <ArrowLeft className="w-5 h-5 text-electric-yellow" /> Voltar para Artigos
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {posts.filter(p => p.id !== selectedPost.id).slice(0, 2).map(post => (
                  <div
                    key={post.id}
                    onClick={() => openPost(post)}
                    className="group cursor-pointer bg-white border border-zinc-200 rounded-xl p-5 flex gap-5 hover:border-yellow-400 hover:shadow-xl transition-all"
                  >
                    <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                      <img
                        src={post.image_url || DEFAULT_POST_IMAGE}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_POST_IMAGE;
                        }}
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 group-hover:text-yellow-600 transition-colors">{post.tag}</span>
                      <h4 className="text-base font-bold text-zinc-900 leading-tight mb-2 line-clamp-2">
                        {post.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

        </div>
      </div >
    );
  }

  // LIST VIEW
  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in pb-20">

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
            <div className="h-44 relative overflow-hidden bg-zinc-800">
              <img
                src={post.image_url || DEFAULT_POST_IMAGE}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_POST_IMAGE;
                }}
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

              <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
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
            className="w-10 h-10 p-0 rounded-full text-white border-zinc-700"
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
            className="w-10 h-10 p-0 rounded-full text-white border-zinc-700"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
};
