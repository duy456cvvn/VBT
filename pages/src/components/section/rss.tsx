import { useState, useEffect, FC, RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronsUpDown, Copy, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "@/components/ui/button";

interface OtherName {
  native?: string;
  romaji?: string;
  english?: string;
}

interface Book {
  name: string;
  other: OtherName[];
  cover: string;
}

interface RepoInfo {
  repo: string;
  branch: string;
}

interface ProcessedFeed {
  title: string;
  coverImage: string;
  link: string;
  sourceProvider: string;
  repoName: string;
}

type RSSSectionProps = {
  sectionRef: RefObject<HTMLDivElement>;
};

const RSSSection: FC<RSSSectionProps> = ({ sectionRef }) => {
  const [feeds, setFeeds] = useState<ProcessedFeed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        // const isProduction = process.env.NODE_ENV === "production";
        const apiUrl =
          "https://raw.githubusercontent.com/Irilith/VBT/refs/heads/main/rss.json";
        const repoResponse = await fetch(apiUrl);
        const repoData: RepoInfo[] = await repoResponse.json();

        const allFeeds: ProcessedFeed[] = [];

        for (const repo of repoData) {
          const username = repo.repo.split("/")[3];
          const repoName = repo.repo.split("/")[4];
          const watchlistUrl = `https://raw.githubusercontent.com/${username}/${repoName}/refs/heads/${repo.branch}/watchlist.json`;
          const watchlistResponse = await fetch(watchlistUrl);
          const watchlistData: Book[] = await watchlistResponse.json();

          const processedFeeds = watchlistData.map((book) => {
            const rssFileName = (
              book.other.find((o) => o.romaji)?.romaji || book.name
            ).replace(/[<>:"/\\|?*\s]/g, "_");

            return {
              title: book.name,
              coverImage: book.cover,
              link: `https://raw.githubusercontent.com/${username}/${repoName}/refs/heads/${repo.branch}/feed/rss/${rssFileName}.rss`,
              sourceProvider: username,
              repoName: repoName,
            };
          });

          allFeeds.push(...processedFeeds);
        }

        setFeeds(allFeeds);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch RSS feeds");
        setLoading(false);
      }
    };

    fetchFeeds();
  }, []);

  const filteredFeeds = selectedFeed
    ? feeds.filter((feed) => feed.title === selectedFeed)
    : feeds;

  const toClipboard = (text: string): void => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((e) => {
        console.log(e);
        toast.error("Failed to copy");
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-xl text-slate-300">Loading feeds...</div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-red-500/10 border border-red-500/50 rounded-2xl p-8"
        >
          <div className="text-2xl text-red-400 font-semibold">{error}</div>
        </motion.div>
      </div>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="min-h-screen h-screen relative flex flex-col items-center justify-start py-20 px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl w-full"
      >
        <h2 className="text-5xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          RSS Feeds
        </h2>
        <p className="text-slate-400 text-center mb-10 text-lg">
          Browse and subscribe to your favorite book feeds
        </p>

        <div className="mb-8 max-w-2xl mx-auto">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full h-14 px-6 bg-slate-800/50 backdrop-blur-xl border-slate-700/50 hover:border-blue-500/50 rounded-xl text-white hover:bg-slate-800/70 transition-all duration-300"
              >
                <span className="flex-1 text-left truncate">
                  {selectedFeed || "Search or select a feed..."}
                </span>
                {selectedFeed ? (
                  <X
                    className="ml-2 h-5 w-5 shrink-0 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFeed(null);
                    }}
                  />
                ) : (
                  <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-0 bg-slate-800/95 backdrop-blur-xl text-white border-slate-700/50 shadow-2xl">
              <Command className="bg-transparent">
                <CommandInput
                  placeholder="Search feed title..."
                  className="bg-transparent text-white placeholder:text-slate-400 border-b border-slate-700/50"
                />
                <CommandList className="bg-transparent max-h-80">
                  <CommandEmpty className="text-slate-400 py-8 text-center">
                    No feed found.
                  </CommandEmpty>
                  <CommandGroup>
                    {feeds.map((feed) => (
                      <CommandItem
                        key={feed.title}
                        onSelect={() => {
                          setSelectedFeed(
                            selectedFeed === feed.title ? null : feed.title,
                          );
                          setOpen(false);
                        }}
                        className="hover:bg-slate-700/50 text-white cursor-pointer py-3 px-4"
                      >
                        <Check
                          className={`mr-3 h-5 w-5 ${selectedFeed === feed.title ? "opacity-100 text-blue-400" : "opacity-0"}`}
                        />
                        {feed.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-full bg-gradient-to-br from-slate-800/40 to-slate-800/20 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
          <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar relative z-0">
            {" "}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedFeed || "all"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredFeeds.map((feed, index) => (
                  <motion.div
                    key={feed.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="group bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20"
                  >
                    <div className="relative w-full h-64 overflow-hidden">
                      <Image
                        src={feed.coverImage}
                        alt={feed.title}
                        width={400}
                        height={600}
                        className="object-cover object-top w-full h-full transition-transform duration-500 group-hover:scale-110"
                        priority={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-3 text-white line-clamp-2 leading-tight">
                        {feed.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-4 text-slate-300">
                        <Avatar className="w-8 h-8 border-2 border-slate-600">
                          <AvatarImage
                            src={`https://github.com/${feed.sourceProvider}.png`}
                            alt={`@${feed.sourceProvider}`}
                          />
                          <AvatarFallback className="bg-slate-700 text-xs">
                            {feed.sourceProvider.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-400">Source</p>
                          <Link
                            href={`https://github.com/${feed.sourceProvider}/${feed.repoName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:text-blue-400 transition-colors truncate block"
                          >
                            {feed.sourceProvider}
                          </Link>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={feed.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View
                        </Link>
                        <button
                          onClick={() => toClipboard(feed.link)}
                          className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                          aria-label="Copy feed URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
      `}</style>
    </section>
  );
};

export default RSSSection;
