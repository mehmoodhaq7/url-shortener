import { Link2 } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Link2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">
            Snip<span className="text-indigo-400">ly</span>
          </span>
        </div>
        <span className="text-xs text-gray-500 font-mono bg-gray-800 px-2.5 py-1 rounded-full">
          {import.meta.env.VITE_APP_VERSION || "v1"}
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
