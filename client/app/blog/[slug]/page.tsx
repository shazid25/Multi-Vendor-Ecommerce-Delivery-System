// import React from "react";
// import Link from "next/link";
// import { Navbar } from "@/components/shared/navbar";
// import { Footer } from "@/components/shared/footer";
// import { getBlogBySlug } from "@/app/actions/mart-actions";
// import { formatDate } from "@/lib/utils";
// import { Calendar, User, ArrowLeft } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { notFound } from "next/navigation";

// export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
//   const res = await getBlogBySlug(params.slug);
//   if (!res.success) return notFound();
//   const blog = res.data;

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Navbar />
//       <main className="flex-grow pt-32 pb-20 px-4">
//         <article className="max-w-3xl mx-auto">
//           <Link href="/blog">
//             <Button variant="ghost" size="sm" className="mb-8 group">
//               <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back to Blog
//             </Button>
//           </Link>

//           <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
//             <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(blog.createdAt)}</span>
//             <span className="flex items-center gap-1"><User className="w-4 h-4" /> {blog.author}</span>
//           </div>

//           <h1 className="text-4xl md:text-5xl font-bold mb-8 mart-gradient-text italic leading-tight">
//             {blog.title}
//           </h1>

//           {blog.image && (
//             <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl">
//               <img 
//                 src={blog.image} 
//                 alt={blog.title}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//           )}

//           <div 
//             className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-muted-foreground space-y-6"
//             dangerouslySetInnerHTML={{ __html: blog.content }}
//           />
//         </article>
//       </main>
//       <Footer />
//     </div>
//   );
// }




import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { getBlogBySlug } from "@/app/actions/mart-actions";
import { formatDate } from "@/lib/utils";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

// Update the type to reflect that params is a Promise in Next.js 15
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: PageProps) {
  // Await the params to get the slug
  const { slug } = await params;
  
  const res = await getBlogBySlug(slug);
  
  if (!res.success) return notFound();
  const blog = res.data;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4">
        <article className="max-w-3xl mx-auto">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back to Blog
            </Button>
          </Link>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {formatDate(blog.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" /> {blog.author}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-8 mart-gradient-text italic leading-tight">
            {blog.title}
          </h1>

          {blog.image && (
            <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl">
              <img 
                src={blog.image} 
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div 
            className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-muted-foreground space-y-6"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
      </main>
      <Footer />
    </div>
  );
}