'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'
import StaggeredMenu from '../staggered-menu/StaggeredMenu'
import '../landing/LandingPage.css' // Import styles for sticky-nav
import { Youtube } from 'lucide-react'

export default function SiteHeader() {
    const pathname = usePathname()
    const isLandingPage = pathname === '/'
    
    const { scrollY } = useScroll()
    const [showNav, setShowNav] = useState(!isLandingPage)

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (!isLandingPage) return // On other pages, it is always visible

        if (latest > (typeof window !== 'undefined' ? window.innerHeight * 0.8 : 800)) {
            setShowNav(true)
        } else {
            setShowNav(false)
        }
    })

    const menuItems = [
        { label: 'Solutions', link: '/solutions' },
        { label: 'Pricing', link: '/pricing' },
        { label: 'About', link: '/about' },
        { label: 'Blog', link: '/blog' },
        { label: 'Contact', link: '/#book-demo' },
    ];

    const socialItems = [
        { label: 'YouTube', link: 'https://youtube.com/@bigchalkbox_ai', icon: <Youtube size={20} /> },
    ];

    return (
        <>
            <AnimatePresence>
                {showNav && (
                    <motion.nav 
                        className="sticky-nav"
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="shell flex justify-between items-center w-full px-0">
                            <Link href="/" className="sticky-nav-left" style={{ textDecoration: 'none' }}>
                                <img src="/logo_new/logo.png" alt="Icon" className="nav-icon" />
                                <span className="nav-logo-text-solid" style={{ fontFamily: "'Amaranth', sans-serif" }}><span className="accent">Big</span>Chalk<span className="accent">Box</span></span>
                            </Link>
                            <div className="sticky-nav-right">
                                <div className="pill-wrapper hide-mobile">
                                    <Link href="/solutions" className="pill-button outline sticky-nav-btn">
                                        Explore Products
                                    </Link>
                                </div>
                                <div className="pill-wrapper hide-mobile">
                                    <Link href="/#book-demo" className="pill-button dark sticky-nav-btn">
                                        Book a Free Demo
                                    </Link>
                                </div>
                                <div className="menu-spacer"></div>
                            </div>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
            <StaggeredMenu
                position="right"
                items={menuItems}
                socialItems={socialItems}
                displaySocials={true}
                displayItemNumbering={false}
                menuButtonColor={showNav ? "#0F5A37" : "#ffffff"}
                openMenuButtonColor="#f5f0e8"
                changeMenuColorOnOpen={true}
                colors={['#083D24', '#0B472A']}
                logoUrl=""
                accentColor="#c8a84b"
                isFixed={true}
            />
        </>
    )
}
