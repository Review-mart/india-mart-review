import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#15284f] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="text-6xl font-black text-[#d9383a]">404</div>
      <h2 className="text-xl font-bold">Page Not Found</h2>
      <p className="text-xs text-gray-300 max-w-sm">
        The requested page does not exist on IndiaMART Review & Feedback Portal.
      </p>
      <Link
        href="/"
        className="bg-[#d9383a] hover:bg-[#c42e30] text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md"
      >
        Return to Home Page
      </Link>
    </div>
  );
}
