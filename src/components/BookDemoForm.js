"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import "./BookDemoForm.css";

export default function BookDemoForm() {
    const [formStatus, setFormStatus] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    function fireConfetti() {
        const end = Date.now() + 2000
            ; (function frame() {
                confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } })
                confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } })
                if (Date.now() < end) requestAnimationFrame(frame)
            })()
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        const fd = new FormData(e.target)
        const data = {
            full_name: fd.get('fullName'),
            institution_name: fd.get('institution'),
            designation: fd.get('role'),
            email: fd.get('email'),
            phone: fd.get('phone'),
            comments: fd.get('comments'),
            created_at: new Date().toLocaleString('en-IN'),
        }
        try {
            const res = await fetch('https://sheetdb.io/api/v1/vksbsahrgkwky', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [data] }),
            })
            if (res.ok) {
                setFormStatus({ success: true, message: 'Request submitted successfully! We will contact you soon.' })
                fireConfetti()
                e.target.reset()
            } else {
                setFormStatus({ success: false, message: 'Something went wrong. Please try again.' })
            }
        } catch {
            setFormStatus({ success: false, message: 'Network error. Please try again later.' })
        }
        setSubmitting(false)
    }

    return (
        <section className="lp-contact" id="book-demo">
            <div className="lp-container">
                <div className="lp-contact-card">
                    <div className="lp-form-side">
                        <span className="lp-form-tag">Get Started</span>
                        <h2 className="lp-form-title">Book Your Free Demo</h2>
                        <p className="lp-form-desc">See BigChalkBox evaluate a real answer sheet against your rubric live. Fill out the form and we'll set it up.</p>

                        {formStatus ? (
                            <div className="lp-success">
                                <span className="material-symbols-outlined">check_circle</span>
                                <p>{formStatus.message}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="lp-form">
                                <div>
                                    <label>Full Name</label>
                                    <input name="fullName" required placeholder="e.g. Dr. Sharma" type="text" />
                                </div>
                                <div className="lp-form-grid">
                                    <div>
                                        <label>Institution</label>
                                        <input name="institution" required placeholder="e.g. Delhi University" type="text" />
                                    </div>
                                    <div>
                                        <label>Role</label>
                                        <div className="lp-select-wrap">
                                            <select name="role">
                                                <option>Select Role</option>
                                                <option>Faculty</option>
                                                <option>HOD / Dean</option>
                                                <option>Administrator</option>
                                                <option>IT Support</option>
                                            </select>
                                            <div className="chevron">
                                                <span className="material-symbols-outlined">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="lp-form-grid">
                                    <div>
                                        <label>Email</label>
                                        <input name="email" required placeholder="name@institution.edu" type="email" />
                                    </div>
                                    <div>
                                        <label>Phone Number</label>
                                        <input name="phone" required placeholder="+91 98765 43210" type="tel" />
                                    </div>
                                </div>
                                <div>
                                    <label>Comments</label>
                                    <textarea name="comments" rows={3} placeholder="Any specific requirements or questions?" style={{ resize: 'none' }} />
                                </div>
                                <button type="submit" className="lp-btn-submit" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Book Demo'}
                                </button>
                            </form>
                        )}
                    </div>
                    <div className="lp-contact-dark">
                        <div className="bg-map">
                            <img alt="World Map background" src="/images/landing/world_map.png" />
                        </div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3>Have questions? Reach out directly.</h3>
                            <div className="lp-contact-info">
                                <div className="lp-contact-row">
                                    <div className="icon-box">
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>mail</span>
                                    </div>
                                    <div>
                                        <div className="sub-label">BigChalkBox AI</div>
                                        <div className="value">admin@bigchalkbox.com</div>
                                    </div>
                                </div>
                                <div className="lp-contact-row">
                                    <div className="icon-box">
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>call</span>
                                    </div>
                                    <div>
                                        <div className="sub-label">Phone</div>
                                        <div className="value">+91 7529836117</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lp-contact-footer">
                            <div className="social">
                                <span className="material-symbols-outlined">public</span>
                                <span className="material-symbols-outlined">share</span>
                            </div>
                            <div className="copy">© {new Date().getFullYear()} BCBX INNOVATIONS PRIVATE LIMITED.</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
