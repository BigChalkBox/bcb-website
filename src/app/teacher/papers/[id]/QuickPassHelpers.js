// QuickPass Helper Functions - Add to UploadAndExtract.js

/**
 * Calculate Paper Health Score (0-100)
 */
function calculatePaperHealth(intelligence) {
    if (!intelligence?.quickpass) return 100;

    const qp = intelligence.quickpass;
    let score = 100;

    // Deduct points for issues
    const highAmbiguity = qp.ambiguity.flags.filter(f => f.severity === 'high').length;
    const mediumAmbiguity = qp.ambiguity.flags.filter(f => f.severity === 'medium').length;
    const lowAmbiguity = qp.ambiguity.flags.filter(f => f.severity === 'low').length;

    score -= (highAmbiguity * 15);  // -15 per high ambiguity
    score -= (mediumAmbiguity * 8); // -8 per medium ambiguity
    score -= (lowAmbiguity * 3);    // -3 per low ambiguity

    score -= (qp.or_conflicts.issues.length * 12); // -12 per OR conflict
    score -= (qp.marks_effort.warnings.length * 6); // -6 per marks issue
    score -= (qp.duplicates.pairs.length * 10); // -10 per duplicate

    return Math.max(0, Math.min(100, score));
}

/**
 * Get risk level based on health score
 */
function getRiskLevel(score) {
    if (score >= 85) return { level: 'Low', color: 'green', message: 'Paper is well-structured and safe for evaluation' };
    if (score >= 65) return { level: 'Medium', color: 'yellow', message: 'Paper may lead to 2-3 marking disputes' };
    return { level: 'High', color: 'red', message: 'Paper has significant issues that need attention' };
}

/**
 * Get health bar fill percentage and color
 */
function getHealthBarStyle(score) {
    const color = score >= 85 ? '#10b981' : score >= 65 ? '#f59e0b' : '#ef4444';
    return { width: `${score}%`, backgroundColor: color };
}

/**
 * Count issue severity levels
 */
function countIssueSeverity(intelligence) {
    const qp = intelligence.quickpass;

    const critical = qp.ambiguity.flags.filter(f => f.severity === 'high').length +
        qp.or_conflicts.issues.length;

    const medium = qp.ambiguity.flags.filter(f => f.severity === 'medium').length +
        qp.marks_effort.warnings.length;

    const minor = qp.ambiguity.flags.filter(f => f.severity === 'low').length +
        qp.duplicates.pairs.length;

    return { critical, medium, minor };
}
