import React from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { PageTransition, GlassCard } from "@/components/shared/mart-ui";
import { getHelpEntries } from "@/app/actions/mart-actions";
import { Search, HelpCircle, Book, MessageCircle, ArrowRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

function HelpContent({ initialEntries }: { initialEntries: any[] }) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [entries] = React.useState(initialEntries);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Group by category
  const categories = entries.reduce((acc: any, entry: any) => {
    const cat = entry.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-primary/5 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 mart-gradient-text italic">How can we help you?</h1>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search for help articles..." 
                className="pl-12 h-14 rounded-2xl border-primary/20 bg-background shadow-xl focus-visible:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* Categories grid */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <GlassCard className="p-8 text-center hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 rounded-2xl mart-gradient-bg flex items-center justify-center text-white mx-auto mb-6">
                <Book className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Knowledge Base</h3>
              <p className="text-muted-foreground text-sm">Detailed guides and documentation for everything Green Mart.</p>
            </GlassCard>
            <GlassCard className="p-8 text-center hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 rounded-2xl mart-gradient-bg flex items-center justify-center text-white mx-auto mb-6">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-muted-foreground text-sm">Get help from our community of users and experts.</p>
            </GlassCard>
            <GlassCard className="p-8 text-center hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 rounded-2xl mart-gradient-bg flex items-center justify-center text-white mx-auto mb-6">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Support Ticket</h3>
              <p className="text-muted-foreground text-sm">Can't find what you're looking for? Open a support ticket.</p>
            </GlassCard>
          </div>

          <div className="space-y-16">
            {Object.keys(categories).map((cat) => (
              <div key={cat}>
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                  <span className="w-2 h-8 mart-gradient-bg rounded-full" />
                  {cat}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories[cat].map((entry: any) => {
                    const isExpanded = expandedIds.has(entry.id);
                    return (
                      <div
                        key={entry.id}
                        onClick={() => toggleExpand(entry.id)}
                        className="p-6 rounded-2xl border border-border hover:bg-muted/50 transition-all duration-300 group cursor-pointer overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 pr-4">
                            <h4 className="font-semibold group-hover:text-primary transition-colors">{entry.title}</h4>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform duration-300 flex-shrink-0 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>

                        {/* Answer Section */}
                        {isExpanded && entry.content && (
                          <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {entry.content}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default async function HelpPage() {
  const res = await getHelpEntries();
  const entries = res.success ? res.data : [];

  return <HelpContent initialEntries={entries} />;
}
