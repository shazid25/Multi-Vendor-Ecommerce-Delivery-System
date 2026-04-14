import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { PageTransition, GlassCard } from "@/components/shared/mart-ui";
import { getBlogs } from "@/app/actions/mart-actions";
import { formatDate } from "@/lib/utils";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BlogPage() {
  const res = await getBlogs();
  const blogs = res.success ? res.data : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 mart-gradient-text italic">Green Mart Blog</h1>
            <p className="text-muted-foreground text-lg">Latest news, recipes, and tips for a healthier lifestyle</p>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed">
              <p className="text-muted-foreground">No blog posts found yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog: any) => (
                <GlassCard key={blog.id} className="overflow-hidden group flex flex-col h-full">
                  {blog.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={blog.image} 
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(blog.createdAt)}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {blog.author}</span>
                    </div>
                    <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h2>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                      {blog.content.replace(/<[^>]*>/g, '')}
                    </p>
                    <Link href={`/blog/${blog.slug}`}>
                      <Button variant="ghost" className="group/btn p-0 hover:bg-transparent text-primary font-semibold">
                        Read More <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
