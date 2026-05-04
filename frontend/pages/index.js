import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getUser } from '../lib/auth';

export default function Home() {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'shopkeeper':
          router.push('/shopkeeper/orders');
          break;
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'supplier':
          router.push('/supplier/requests');
          break;
        default:
          router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router, user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
