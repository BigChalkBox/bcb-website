import React, { useEffect, useRef } from "react";
import "./morphing-text.css";

const morphTime = 2.5;
const cooldownTime = 1.5;

export const MorphingText = ({ texts, className = "" }) => {
    const text1Ref = useRef(null);
    const text2Ref = useRef(null);

    useEffect(() => {
        let textIndex = texts.length - 1;
        let time = new Date();
        let morph = 0;
        let cooldown = cooldownTime;

        if (!text1Ref.current || !text2Ref.current) return;

        text1Ref.current.textContent = texts[textIndex % texts.length];
        text2Ref.current.textContent = texts[(textIndex + 1) % texts.length];

        function doMorph() {
            morph -= cooldown;
            cooldown = 0;

            let fraction = morph / morphTime;

            if (fraction > 1) {
                cooldown = cooldownTime;
                fraction = 1;
            }

            setMorph(fraction);
        }

        function setMorph(fraction) {
            if (!text1Ref.current || !text2Ref.current) return;

            text2Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
            text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

            let fraction1 = 1 - fraction;
            text1Ref.current.style.filter = `blur(${Math.min(8 / fraction1 - 8, 100)}px)`;
            text1Ref.current.style.opacity = `${Math.pow(fraction1, 0.4) * 100}%`;

            text1Ref.current.textContent = texts[textIndex % texts.length];
            text2Ref.current.textContent = texts[(textIndex + 1) % texts.length];
        }

        function doCooldown() {
            morph = 0;
            if (!text1Ref.current || !text2Ref.current) return;

            text2Ref.current.style.filter = "";
            text2Ref.current.style.opacity = "100%";

            text1Ref.current.style.filter = "";
            text1Ref.current.style.opacity = "0%";
        }

        let animationFrameId;

        function animate() {
            animationFrameId = requestAnimationFrame(animate);

            let newTime = new Date();
            let shouldIncrementIndex = cooldown > 0;
            let dt = (newTime.getTime() - time.getTime()) / 1000;
            time = newTime;

            cooldown -= dt;

            if (cooldown <= 0) {
                if (shouldIncrementIndex) {
                    textIndex++;
                }

                doMorph();
            } else {
                doCooldown();
            }
        }

        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, [texts]);

    return (
        <div className={`morphing-wrapper ${className}`}>
            <span ref={text1Ref} className="morphing-layer"></span>
            <span ref={text2Ref} className="morphing-layer"></span>
            
            <svg id="filters" className="hidden-svg">
                <defs>
                    <filter id="threshold">
                        <feColorMatrix
                            in="SourceGraphic"
                            type="matrix"
                            values="1 0 0 0 0
                                    0 1 0 0 0
                                    0 0 1 0 0
                                    0 0 0 255 -140"
                        />
                    </filter>
                </defs>
            </svg>
        </div>
    );
};
