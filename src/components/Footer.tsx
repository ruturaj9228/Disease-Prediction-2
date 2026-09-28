export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <span className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} AI HealthAssist Prototype. Academic Project.
            </span>
          </div>
          <div className="mt-4 flex justify-center md:mt-0 space-x-6 text-sm text-slate-500">
            <span>For informational purposes only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
