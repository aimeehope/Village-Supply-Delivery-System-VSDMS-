import '../styles/globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Check authentication on route change
    const handleRouteChange = () => {
      const token = localStorage.getItem('token');
      const publicRoutes = ['/login', '/register'];
      
      if (!token && !publicRoutes.includes(router.pathname)) {
        router.push('/login');
      }
    };

    handleRouteChange();
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;
