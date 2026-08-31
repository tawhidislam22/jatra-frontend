"use client";

import { useEffect, useState } from "react";
import { CenterCard } from "@/components/modules/centers/CenterCard";
import { AutomotiveCenter } from "@/types/jatra";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { centersService } from "@/services/centers.service";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Wrench } from "lucide-react";

export default function CentersPage() {
  const router = useRouter();
  const [centers, setCenters] = useState<AutomotiveCenter[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [sortBy, setSortBy] = useState("rating");
  const [sortOrder, setSortOrder] = useState("desc");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      if (debouncedSearch) params.searchTerm = debouncedSearch;

      const response = await centersService.getAllCenters(params);
      
      if (response && response.data) {
        setCenters(response.data);
        if (response.meta) {
          setTotal(response.meta.total);
          setTotalPages(response.meta.totalPages);
        }
      } else {
        setCenters(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error("Failed to fetch centers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, [page, limit, debouncedSearch, sortBy, sortOrder]);

  // Handle Sort Change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "highest_rated") {
      setSortBy("rating");
      setSortOrder("desc");
    } else if (val === "a_z") {
      setSortBy("name");
      setSortOrder("asc");
    } else if (val === "z_a") {
      setSortBy("name");
      setSortOrder("desc");
    }
    setPage(1);
  };

  // Pagination Logic
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);
    for (let i = page - delta; i <= page + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }
    if (totalPages > 1) {
      range.push(totalPages);
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-32">
      {/* Zauto Style Header */}
      <div 
        className="py-24 mb-16 relative overflow-hidden bg-fixed bg-center bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3166&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/50 z-0" />
        <motion.div 
          className="absolute top-1/2 left-0 -translate-y-1/2 text-[150px] font-black text-white/5 select-none z-0 tracking-tighter uppercase whitespace-nowrap"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          WORKSHOPS
        </motion.div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-primary font-bold uppercase tracking-[3px] text-xs flex items-center gap-2">
              <span className="w-8 h-[2px] bg-primary"></span>
              Professional Maintenance
            </h3>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white uppercase tracking-tight">
              Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Centers</span>
            </h1>
            <p className="text-gray-400 max-w-xl font-medium text-lg leading-relaxed mt-4">
              Find top-rated workshops and certified mechanics near you. We partner with the best to keep your vehicle running smoothly.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Filters and Controls */}
        <div className="mb-12 bg-white p-6 rounded-md border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-6 items-end justify-between">
          
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search Bar */}
            <div className="flex flex-col gap-2 lg:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Search Workshops</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search by Name or Location..."
                  className="w-full pl-10 pr-4 py-3 bg-[#f9f9f9] border border-gray-200 rounded-sm outline-none focus:border-primary transition-colors text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Sort & Limit */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Sort & Display</label>
              <div className="flex items-center gap-4">
                <select 
                  className="flex-1 px-4 py-3 bg-[#f9f9f9] border border-gray-200 rounded-sm outline-none focus:border-primary transition-colors text-sm font-bold uppercase tracking-widest text-[#1a1a1a]"
                  onChange={handleSortChange}
                  value={sortBy === "rating" ? "highest_rated" : sortBy === "name" && sortOrder === "asc" ? "a_z" : "z_a"}
                >
                  <option value="highest_rated">Highest Rated</option>
                  <option value="a_z">Name: A to Z</option>
                  <option value="z_a">Name: Z to A</option>
                </select>
                
                <select 
                  className="w-24 px-4 py-3 bg-[#f9f9f9] border border-gray-200 rounded-sm outline-none focus:border-primary transition-colors text-sm font-bold text-[#1a1a1a]"
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Top Info Bar */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <div className="text-gray-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Showing {centers.length > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, total)} of {total} Workshops
          </div>
        </div>

        {/* Center Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : centers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {centers.map((c, index) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CenterCard 
                  center={c} 
                  onBook={(id) => router.push(`/centers/${id}`)} 
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-md border border-gray-100">
            <Wrench className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">No Workshops Found</h3>
            <p className="text-gray-500 font-medium">Try adjusting your search to find what you're looking for.</p>
            <button 
              onClick={() => { setSearchTerm(""); setPage(1); }}
              className="mt-6 px-6 py-3 bg-primary text-white font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-orange-600 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-2">
            <button 
              onClick={() => handlePageChange(1)} 
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-sm border border-gray-200 bg-white text-gray-500 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handlePageChange(Math.max(1, page - 1))} 
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-sm border border-gray-200 bg-white text-gray-500 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((num, i) => (
              <button
                key={i}
                onClick={() => typeof num === "number" ? handlePageChange(num) : null}
                disabled={num === "..."}
                className={`w-10 h-10 flex items-center justify-center rounded-sm border transition-all font-bold text-sm ${
                  num === page 
                    ? "bg-primary text-white border-primary" 
                    : num === "..." 
                      ? "border-transparent bg-transparent text-gray-400 cursor-default" 
                      : "border-gray-200 bg-white text-gray-600 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                }`}
              >
                {num}
              </button>
            ))}

            <button 
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))} 
              disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-sm border border-gray-200 bg-white text-gray-500 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handlePageChange(totalPages)} 
              disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-sm border border-gray-200 bg-white text-gray-500 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
