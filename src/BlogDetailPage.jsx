import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, CalendarDays, Tag, Share2, Twitter, Facebook, Linkedin, Loader2, Newspaper } from 'lucide-react';
import { fetchBlogBySlug, fetchBlog } from './api';
import DOMPurify from 'dompurify';

const SITE_URL = 'https://akdenizgkt.com';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBlogBySlug(slug).then(p => {
      if (p) {
        setPost(p);
        fetchBlog('limit=4').then(posts => {
          if (posts) setRelated(posts.filter(r => r.id !== p.id).slice(0, 3));
        });
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <Newspaper className="w-16 h-16 text-slate-200" />
      <h1 className="text-xl font-bold text-slate-800">Yazı bulunamadı</h1>
      <Link to="/blog" className="text-red-500 hover:text-red-600 text-sm font-medium">← Blog'a Dön</Link>
    </div>
  );

  const shareUrl = `${SITE_URL}/blog/${post.slug}`;
  const ogImage = post.cover_image ? `${SITE_URL}${post.cover_image}` : `${SITE_URL}/assets/logo_gkt.png`;

  return (
    <>
      <Helmet>
        <title>{post.title} | Akdeniz GKT Blog</title>
        <meta name="description" content={post.excerpt || post.title} />
        <link rel="canonical" href={shareUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.title} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Akdeniz GKT" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || post.title} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="article:author" content="Akdeniz GKT" />
        <meta name="article:published_time" content={post.date} />
        <meta name="article:section" content={post.category} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.excerpt,
          "datePublished": post.date,
          "dateModified": post.updated_at,
          "author": { "@type": "Organization", "name": "Akdeniz GKT" },
          "publisher": { "@type": "Organization", "name": "Akdeniz GKT", "logo": { "@type": "ImageObject", "url": SITE_URL + "/assets/logo_gkt.png" } }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Anasayfa","item":"https://akdenizgkt.com/"},{"@type":"ListItem","position":2,"name":"Blog","item":"https://akdenizgkt.com/blog"},{"@type":"ListItem","position":3,"name":post.title,"item":shareUrl}]})}</script>
      </Helmet>

      <article className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
        {/* Cover image or gradient header */}
        {post.cover_image ? (
          <div className="w-full max-h-[400px] overflow-hidden">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-slate-900 via-slate-800 to-red-950" />
        )}

        <div className="max-w-[900px] mx-auto px-6 py-10">
          {/* Back button */}
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 transition-colors mb-8 no-underline">
            <ArrowLeft className="w-4 h-4" /> Blog'a Dön
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            {post.category && <span className="px-2.5 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{post.category}</span>}
            {post.date && <span className="flex items-center gap-1 text-xs text-slate-400"><CalendarDays className="w-3 h-3" /> {post.date}</span>}
            <span className="text-xs text-slate-400">GKT Medya</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-slate-500 leading-relaxed mb-8 pb-8 border-b border-gray-200">{post.excerpt}</p>
          )}

          {/* Content */}
          <div
            className="blog-content max-w-none text-slate-600 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:text-slate-800 [&_strong]:font-semibold [&_em]:italic [&_a]:text-red-500 [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-1 [&_li]:text-slate-600 [&_hr]:border-gray-200 [&_hr]:my-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content || '<p>İçerik henüz eklenmedi.</p>', {
              ALLOWED_TAGS: ['h2', 'h3', 'h4', 'p', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'br', 'hr', 'span', 'blockquote'],
              ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
              ADD_ATTR: ['target'],
              ALLOW_DATA_ATTR: false,
              FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'object', 'embed', 'svg', 'math'],
              FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur', 'style'],
            }) }}
          />

          {/* Share buttons */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm font-semibold text-slate-800 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Paylaş</p>
            <div className="flex items-center gap-2">
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors no-underline">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-600"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors no-underline">
                <Facebook className="w-4 h-4 text-slate-600" />
              </a>
              <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors no-underline">
                <Linkedin className="w-4 h-4 text-slate-600" />
              </a>
            </div>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-bold text-slate-900 mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Diğer Yazılar</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map(r => (
                  <Link key={r.id} to={`/blog/${r.slug}`} className="group rounded-xl border border-gray-100 overflow-hidden hover:border-red-200 hover:shadow-md transition-all no-underline">
                    <div className="aspect-[16/10] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
                      {r.cover_image ? <img src={r.cover_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" /> : <Newspaper className="w-6 h-6 text-slate-200" />}
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] text-red-500 font-bold">{r.category}</span>
                      <h3 className="text-sm font-bold text-slate-800 mt-0.5 line-clamp-2 leading-snug">{r.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
