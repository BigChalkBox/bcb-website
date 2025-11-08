import { useState } from 'react';
import styles from './FAQSection.module.css';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

const faqs = [
  {
    question: "What types of answers can DASES evaluate?",
    answer: "DASES is designed for long-form, descriptive answers. It processes handwritten sheets using OCR and evaluates them using structured, rubric-aligned LLM scoring."
  },
  {
    question: "Can educators review and adjust scores?",
    answer: "Yes. Every evaluation includes a human-in-the-loop workflow. Educators can review, calibrate, override, and finalize scores to ensure academic reliability."
  },
  {
    question: "How does DASES ensure fairness and consistency?",
    answer: "DASES uses standardized rubrics, transparent evaluation criteria, and bias-aware scoring to minimize subjectivity and maintain consistent assessment across cohorts."
  },
  {
    question: "Is DASES suitable for large student cohorts?",
    answer: "Absolutely. The platform is built for high-volume exam periods and institutional-level scale, ensuring fast processing without performance drop-offs."
  },
  {
    question: "What reports or outputs do students receive?",
    answer: "Students receive a professionally formatted, question-wise report that includes scores, rubric-aligned feedback, and constructive insights to support better learning."
  }
];


  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.container} id='faqs'>
      <div className={styles.contentWrapper}>
        {/* Decorative leaf - left */}
        <div className={styles.leafLeft}>
          <svg viewBox="0 0 100 200" className={styles.leafSvg}>
            <path
              d="M 50 0 Q 20 50 30 100 Q 35 150 50 200 Q 40 150 35 100 Q 30 50 50 0"
              fill="#216a3b"
            />
            <path
              d="M 50 0 Q 80 50 70 100 Q 65 150 50 200 Q 60 150 65 100 Q 70 50 50 0"
              fill="#216a3b"
            />
          </svg>
        </div>

        {/* Decorative leaf - right */}
        <div className={styles.leafRight}>
          <svg viewBox="0 0 100 200" className={styles.leafSvg}>
            <path
              d="M 50 200 Q 20 150 30 100 Q 35 50 50 0 Q 40 50 35 100 Q 30 150 50 200"
              fill="#216a3b"
            />
            <path
              d="M 50 200 Q 80 150 70 100 Q 65 50 50 0 Q 60 50 65 100 Q 70 150 50 200"
              fill="#216a3b"
            />
          </svg>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <p className={styles.subtitle}>FAQs</p>
            <h1 className={styles.title}>
              <span className={styles.titlePrimary}>Got any questions?</span>
              <br />
              <span className={styles.titlePrimary}>We have </span>
              <span className={styles.titleAccent}>got answers</span>
            </h1>
            <p className={styles.description}>
              Find quick and clear answers to the most common questions about DASES
              <br />
              all in one place.
            </p>
          </div>

          {/* FAQ Items */}
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button
                  onClick={() => toggleFAQ(index)}
                  className={styles.faqButton}
                >
                  <span className={styles.faqQuestion}>{faq.question}</span>
                  <span 
                    className={styles.faqIcon}
                    style={{ transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    +
                  </span>
                </button>
                {openIndex === index && (
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}