'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default function SmoothScroll({ children }) {
    useEffect(() => {
        const lenis = new Lenis({
            autoRaf: true,
            duration: 1.5,
            // Starts fast, slows down dramatically (Quintic Ease Out)
            easing: (t) => 1 - Math.pow(1 - t, 5)
        })

        return () => {
            lenis.destroy()
        }
    }, [])

    return <>{children}</>
}
