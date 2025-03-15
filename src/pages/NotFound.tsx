
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center max-w-md mx-auto px-6">
        <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
          404
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          This page doesn't exist
        </p>
        <div className="glass p-6 rounded-xl mb-8 shadow-subtle">
          <p className="text-gray-600 mb-4">
            The page you're looking for couldn't be found. It might have been moved or doesn't exist.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-subtle"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
