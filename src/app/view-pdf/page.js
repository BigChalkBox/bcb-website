"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import styles from "./PDFViewer.module.css";

function PDFViewerContent() {
    const searchParams = useSearchParams();
    const url = searchParams.get("url");
    const fileName = searchParams.get("name") || "Document";

    if (!url) {
        return (
            <div className={styles.error}>
                <h1>❌ No PDF URL provided</h1>
                <p>Please provide a valid PDF URL to view.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>📄 {decodeURIComponent(fileName)}</h1>
                <a
                    href={url}
                    download
                    className={styles.downloadButton}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ⬇️ Download PDF
                </a>
            </div>
            <div className={styles.pdfContainer}>
                <iframe
                    src={`/api/pdf-proxy?url=${encodeURIComponent(url)}`}
                    className={styles.pdfFrame}
                    title={fileName}
                    type="application/pdf"
                />
            </div>
        </div>
    );
}

export default function PDFViewer() {
    return (
        <Suspense fallback={<div className={styles.loading}>Loading PDF...</div>}>
            <PDFViewerContent />
        </Suspense>
    );
}
