import Link from 'next/link'
import { FaLinkedin, FaInstagram, FaEnvelope } from 'react-icons/fa'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mx-4 md:mx-8 my-6 px-6 py-10 rounded-2xl backdrop-blur-lg bg-white/30 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-xl text-gray-700 dark:text-gray-300">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 sm:mb-12 items-start">
          {/* Brand */}
          <div>
            <div className="relative h-10 w-auto mb-4">
              {/* Light Mode Logo (Black) */}
              <img 
                src="/logos/logo-light.png" 
                alt="matriXO" 
                className="h-10 w-auto rounded-lg block dark:hidden"
              />
              {/* Dark Mode Logo (White) */}
              <img 
                src="/logos/logo-dark.png" 
                alt="matriXO" 
                className="h-10 w-auto rounded-lg absolute top-0 left-0 hidden dark:block"
              />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              Technical workshops, hackathons, and career-focused events for students.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/events" className="hover:text-gray-900 dark:hover:text-white transition-colors">Events</Link></li>
              <li><Link href="/services" className="hover:text-gray-900 dark:hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/team" className="hover:text-gray-900 dark:hover:text-white transition-colors">Team</Link></li>
              <li><Link href="/careers" className="hover:text-gray-900 dark:hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-gray-900 dark:hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              <li><Link href="/services#workshops" className="hover:text-gray-900 dark:hover:text-white transition-colors">Technical Workshops</Link></li>
              <li><Link href="/services#hackathons" className="hover:text-gray-900 dark:hover:text-white transition-colors">Hackathons</Link></li>
              <li><Link href="/services#bootcamps" className="hover:text-gray-900 dark:hover:text-white transition-colors">Bootcamps</Link></li>
              <li><Link href="/services#events" className="hover:text-gray-900 dark:hover:text-white transition-colors">Career Events</Link></li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Socials</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a
                  href="mailto:hello@matrixo.in"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <FaEnvelope className="text-gray-500 dark:text-gray-400" />
                  hello@matrixo.in
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/matrixo_in?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <FaInstagram className="text-gray-500 dark:text-gray-400" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/company/matrixo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <FaLinkedin className="text-gray-500 dark:text-gray-400" />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200/30 dark:border-white/[0.06] pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              © {currentYear} matriXO - An Ed-Tech Startup. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/refund" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cancellations & Refunds</Link>
              <Link href="/data-protection" className="hover:text-gray-900 dark:hover:text-white transition-colors">Data Protection</Link>
              <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
