import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll } from 'framer-motion';

const PixelTransition = () => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 110%", "end start"]
    });

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const gridRef = useRef(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            setDimensions({ width, height });
            
            // Calculate a BLOCK_SIZE that perfectly divides the width so we get perfect squares with no cut-offs
            const targetBlockSize = 24;
            const cols = Math.round(width / targetBlockSize);
            const BLOCK_SIZE = width / cols; 
            
            const rows = Math.ceil(height / BLOCK_SIZE);
            
            const grid = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const rawBias = 1 - (r / (rows - 1)); // 1 at top, 0 at bottom
                    
                    // Keep the top ultra-dense for much longer using a steep quartic curve
                    const easeBias = 1 - Math.pow(1 - rawBias, 4); 
                    const baseBias = easeBias * 0.75 + 0.15; // Maps to 0.15 - 0.90

                    // Make the scatter wider at the bottom and extremely tight at the top
                    const noiseSpread = 0.1 + (1 - easeBias) * 1.0; // Top: 0.1, Bottom: 1.1
                    const randomNoise = (Math.random() - 0.5) * noiseSpread;
                    
                    let threshold = baseBias + randomNoise;
                    threshold = Math.max(0.01, Math.min(0.99, threshold));

                    // Accent density also higher at the top, less at the bottom
                    const accentChance = 0.05 + (easeBias * 0.15); // 5% at bottom, 20% at top
                    const isAccent = Math.random() < accentChance;
                    const accents = ['#BF9B30', '#1A2421', '#3B8A40']; 
                    const accentColor = accents[Math.floor(Math.random() * accents.length)];

                    grid.push({
                        c, r,
                        threshold,
                        isAccent,
                        accentColor,
                        accentDuration: 0.1 + Math.random() * 0.1
                    });
                }
            }
            gridRef.current = { cols, rows, grid, BLOCK_SIZE };
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: true });
        let animationFrameId;

        const render = () => {
            if (!gridRef.current || !canvas) return;
            
            const dpr = window.devicePixelRatio || 1;
            const { width, height } = dimensions;
            
            if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
                canvas.width = Math.round(width * dpr);
                canvas.height = Math.round(height * dpr);
                ctx.scale(dpr, dpr);
            }

            const { grid, BLOCK_SIZE } = gridRef.current;
            const progress = scrollYProgress.get();
            
            const colorStart = '#FFFFFF'; // White (site background)

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < grid.length; i++) {
                const p = grid[i];
                let isFilled = true;
                let fillStyle = colorStart;
                
                // Initialize opacity state if not present
                if (p.opacity === undefined) p.opacity = 1;
                
                // If scroll has passed this pixel's threshold, it should fade out.
                // If scroll goes back up, it should fade back in.
                if (progress >= p.threshold) {
                    p.opacity -= 0.08; // Fades out over ~12 frames (smoothly)
                } else {
                    p.opacity += 0.08; // Fades back in
                }
                
                // Clamp opacity strictly between 0 and 1
                p.opacity = Math.max(0, Math.min(1, p.opacity));

                isFilled = p.opacity > 0;
                fillStyle = colorStart;
                
                // Flash accent colors just before vanishing
                if (p.isAccent && progress > 0.02) {
                    const dist = p.threshold - progress;
                    if (dist > 0 && dist < p.accentDuration) {
                        fillStyle = p.accentColor;
                        // Accents remain fully opaque while flashing
                        p.opacity = 1; 
                        isFilled = true;
                    }
                }

                if (progress === 0) { isFilled = true; fillStyle = colorStart; p.opacity = 1; }
                if (progress === 1) { isFilled = false; p.opacity = 0; }

                if (isFilled && p.opacity > 0) {
                    ctx.globalAlpha = p.opacity;
                    ctx.fillStyle = fillStyle;
                    
                    const x = Math.round(p.c * BLOCK_SIZE);
                    const y = Math.round(p.r * BLOCK_SIZE);
                    const size = Math.ceil(BLOCK_SIZE);
                    
                    ctx.fillRect(x, y, size, size);
                    ctx.globalAlpha = 1; // reset alpha
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [dimensions, scrollYProgress]);

    return (
        <div ref={containerRef} style={{ background: 'transparent', height: '1200px', width: '100%', position: 'relative', zIndex: 10, marginTop: '-20rem', marginBottom: '-240px', pointerEvents: 'none' }}>
            <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
            />
        </div>
    );
};

export default PixelTransition;
