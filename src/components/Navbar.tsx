import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Symptom Chat', path: '/chat' },
    { name: 'History', path: '/history' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-50 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-primary-600" />
              </div>
              <span className="font-semibold text-xl text-slate-800 tracking-tight">
                AI HealthAssist
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary-600',
                  isActive(link.path) ? 'text-primary-600' : 'text-slate-600'
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/chat"
              className="btn-primary py-2 px-4 text-sm"
            >
              Start Assessment
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-slate-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white absolute w-full shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="px-3 py-2">
              <Link
                to="/chat"
                onClick={() => setIsOpen(false)}
                className="w-full flex justify-center btn-primary py-2"
              >
                Start Assessment
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
