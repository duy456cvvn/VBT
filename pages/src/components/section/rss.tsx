import { useState, useEffect, FC, RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronsUpDown } from "lucide-react";
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
        const isProduction = process.env.NODE_ENV === "production";
        const apiUrl = isProduction
          ? "https://raw.githubusercontent.com/Irilith/VBT/refs/heads/main/rss.json"
          : "http://localhost:8080/rss.json";
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
            ).replace(/ /g, "_");

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
        toast.success("Copied", {});
      })
      .catch((e) => {
        console.log(e);
        toast.error("Error", {});
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-white">Loading feeds...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="min-h-screen relative flex flex-col items-center justify-start py-12 px-6"
    >
      <h2 className="text-4xl font-bold mb-8">RSS Feeds</h2>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full max-w-7xl px-4 py-2 bg-gray-900 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {selectedFeed || "Select feed title..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 bg-gray-900 text-white border-gray-800 ">
          <Command className="bg-gray-900">
            <CommandInput
              placeholder="Search feed title..."
              className="bg-gray-900 text-white placeholder:text-gray-400"
            />
            <CommandList className="bg-gray-900">
              <CommandEmpty className="text-gray-400">
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
                    className="hover:bg-gray-800 text-white"
                  >
                    {feed.title}
                    <Check
                      className={`ml-auto ${selectedFeed === feed.title ? "opacity-100" : "opacity-0"}`}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="w-full max-w-10xl h-[70vh] overflow-y-auto bg-gray-800 rounded-lg p-5 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFeeds.map((feed, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-700 p-4 rounded-xl hover:bg-gray-600 transition-colors"
            >
              <div className="relative w-full h-48 mb-4 overflow-hidden">
                <Image
                  src={feed.coverImage}
                  alt={feed.title}
                  width={400}
                  height={600}
                  className="object-cover object-top rounded-lg w-full h-full transition-transform hover:scale-105 duration-300"
                  priority={false}
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feed.title}</h3>
              <div className="flex items-center gap-2 mb-3 text-gray-300">
                <Avatar>
                  <AvatarImage
                    src={`https://github.com/${feed.sourceProvider}.png`}
                    alt={`@${feed.sourceProvider}`}
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  Watchlist Source:{" "}
                  <Link
                    href={`https://github.com/${feed.sourceProvider}/${feed.repoName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {feed.sourceProvider}
                  </Link>
                </span>
              </div>
              <div className=" space-x-2">
                <Link
                  href={feed.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  View RSS Feed
                </Link>
                <button
                  onClick={() => toClipboard(feed.link)}
                  className="inline-block bg-blue-600 px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Copy Feed Url
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RSSSection;
