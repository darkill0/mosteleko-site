
import { Layout } from "@/components/Layout";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="mb-6 text-destructive">
          <AlertTriangle size={64} />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          Страница не найдена. Возможно, она была перемещена или удалена.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
        >
          <Home className="mr-2 h-5 w-5" />
          Вернуться на главную
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
