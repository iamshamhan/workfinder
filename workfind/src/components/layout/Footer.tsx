import Link from 'next/link'
import { Mail, Phone, MapPin, Globe, MessageSquare, Camera } from 'lucide-react'
import { SRI_LANKAN_DISTRICTS } from '@/constants/sri-lanka'

const footerLinks = {
  company: [
    { name: 'About us', href: '/about' },
    { name: 'How it works', href: '/how-it-works' },
    { name: 'Contact us', href: '/contact' },
    { name: 'Locations', href: '/locations' },
  ],
  support: [
    { name: 'Help and FAQ', href: '/help' },
    { name: 'Browse services', href: '/browse' },
    { name: 'Search', href: '/search' },
  ],
  legal: [
    { name: 'Terms and conditions', href: '/terms' },
    { name: 'Privacy policy', href: '/privacy' },
  ],
  forProviders: [
    { name: 'Post a service', href: '/auth/register?role=provider' },
    { name: 'Provider sign in', href: '/auth/login' },
    { name: 'Categories', href: '/categories' },
  ],
}

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/workfind', icon: Globe },
  { name: 'Twitter', href: 'https://twitter.com/workfind', icon: MessageSquare },
  { name: 'Instagram', href: 'https://instagram.com/workfind', icon: Camera },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/workfind', icon: Globe },
]

const topCategories = [
  'Electrical', 'Plumbing', 'Cleaning', 'Construction', 'Repairs',
  'Transport', 'Education', 'Technology', 'Beauty', 'Events'
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-secondary-900 text-secondary-300" role="contentinfo">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-primary-400 transition-colors mb-4" aria-label="WorkFind Home">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="currentColor"/>
                <path d="M8 12h16M8 16h12M8 20h8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span className="font-bold text-xl tracking-tight">WorkFind</span>
            </Link>
            <p className="text-secondary-400 mb-6 max-w-sm">
              Sri Lanka's trusted marketplace for finding skilled professionals and service providers.
              Connect with verified experts for any job, big or small.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="tel:+94112345678" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>+94 11 234 5678</span>
              </a>
              <a href="mailto:support@workfind.lk" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span>support@workfind.lk</span>
              </a>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-secondary-500">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>Colombo, Sri Lanka</span>
            </div>
          </div>

          {/* Company Links */}
          <nav aria-label="Company">
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support Links */}
          <nav aria-label="Support">
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal Links */}
          <nav aria-label="Legal">
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* For Providers */}
          <nav aria-label="For Providers">
            <h3 className="font-semibold text-white mb-4">For Providers</h3>
            <ul className="space-y-3">
              {footerLinks.forProviders.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Categories & Social */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 pt-8 border-t border-secondary-800">
          <nav aria-label="Popular Categories">
            <h3 className="font-semibold text-white mb-4">Popular Categories</h3>
            <div className="flex flex-wrap gap-2">
              {topCategories.map((category) => (
                <Link
                  key={category}
                  href={`/categories/${category.toLowerCase()}`}
                  className="text-sm px-3 py-1.5 bg-secondary-800 rounded-full hover:bg-primary-900 hover:text-white transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </nav>

          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold text-white mb-4">Service Areas</h3>
            <ul className="space-y-2 text-sm">
              {SRI_LANKAN_DISTRICTS.slice(0, 8).map((district) => (
                <li key={district.id}>
                  <Link
                    href={`/browse?district=${district.id}`}
                    className="hover:text-white transition-colors"
                  >
                    {district.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/locations" className="hover:text-white transition-colors font-medium">
                  View all locations →
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-white mb-2">Follow Us</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-10 h-10 rounded-xl bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-primary-900 hover:text-white transition-colors"
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-sm text-secondary-500 mt-2">
              Stay updated with latest services and offers
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-secondary-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-secondary-500">
              © {currentYear} WorkFind. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-secondary-500">
              <span>Made with care for Sri Lanka</span>
              <Link href="/accessibility" className="hover:text-white transition-colors">
                Accessibility
              </Link>
              <Link href="/sitemap" className="hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}