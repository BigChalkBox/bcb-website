/**
 * Bloom's Taxonomy Classifier
 * 
 * Analyzes question text to determine cognitive level (1-6):
 * 1. Remember - Recall facts, terms, concepts
 * 2. Understand - Explain ideas, concepts
 * 3. Apply - Use information in new situations
 * 4. Analyze - Draw connections, distinguish parts
 * 5. Evaluate - Justify decisions, critique
 * 6. Create - Produce new work, combine elements
 */

import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Bloom's action verb mappings for quick heuristic classification
const BLOOM_VERBS = {
    1: ['define', 'list', 'name', 'identify', 'label', 'state', 'describe', 'recall', 'recognize', 'select', 'match'],
    2: ['explain', 'summarize', 'interpret', 'classify', 'compare', 'contrast', 'distinguish', 'estimate', 'discuss', 'predict'],
    3: ['apply', 'demonstrate', 'illustrate', 'solve', 'use', 'execute', 'implement', 'operate', 'calculate', 'show'],
    4: ['analyze', 'examine', 'investigate', 'categorize', 'differentiate', 'organize', 'deconstruct', 'attribute', 'outline'],
    5: ['evaluate', 'assess', 'critique', 'judge', 'justify', 'argue', 'defend', 'support', 'rate', 'prioritize', 'recommend'],
    6: ['create', 'design', 'develop', 'formulate', 'construct', 'plan', 'produce', 'invent', 'compose', 'generate', 'propose']
};

/**
 * Quick heuristic classification based on action verbs
 */
function heuristicClassify(questionText) {
    const lowerText = questionText.toLowerCase();

    for (let level = 6; level >= 1; level--) {
        for (const verb of BLOOM_VERBS[level]) {
            if (lowerText.includes(verb)) {
                return { level, confidence: 0.6, method: 'heuristic', verb };
            }
        }
    }

    return null;
}

/**
 * LLM-based classification for more nuanced analysis
 */
async function llmClassify(questionText, marks = null) {
    const prompt = `Analyze this exam question and classify it according to Bloom's Taxonomy cognitive levels:

1. Remember (recall facts, basic knowledge)
2. Understand (explain, interpret, summarize)
3. Apply (use in new situations, solve problems)
4. Analyze (break down, find relationships, distinguish)
5. Evaluate (judge, critique, justify)
6. Create (design, construct, produce new work)

Question: "${questionText}"
${marks ? `Marks: ${marks}` : ''}

Respond with ONLY a JSON object in this exact format:
{
  "level": <number 1-6>,
  "reasoning": "<brief 1-line explanation>",
  "confidence": <0.0-1.0>
}`;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        if (!result || !result.response) {
            throw new Error('Invalid LLM response structure');
        }

        let rawText = "";
        // Handle potentially different response structures or missing text
        if (typeof result.response.text === 'function') {
            rawText = result.response.text();
        } else if (result.response.text) {
            rawText = result.response.text;
        } else if (result.response.candidates?.length) {
            rawText = result.response.candidates[0].content?.parts?.[0]?.text?.trim() || "";
        }

        // Extract JSON from response
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in LLM response');
        }

        const classification = JSON.parse(jsonMatch[0]);

        return {
            level: classification.level,
            confidence: classification.confidence || 0.8,
            reasoning: classification.reasoning,
            method: 'llm'
        };
    } catch (error) {
        console.error('LLM classification failed:', error);
        return null;
    }
}

/**
 * Classify a question using hybrid approach
 * @param {string} questionText - The question text to classify
 * @param {number} marks - Optional marks allocation
 * @param {boolean} useLLM - Whether to use LLM (default: true)
 * @returns {Promise<{level: number, confidence: number, method: string, reasoning?: string}>}
 */
export async function classifyQuestion(questionText, marks = null, useLLM = true) {
    if (!questionText || questionText.trim().length === 0) {
        return { level: null, confidence: 0, method: 'none', reasoning: 'Empty question' };
    }

    // Try heuristic first for speed
    const heuristic = heuristicClassify(questionText);

    // If heuristic is confident enough, use it
    if (heuristic && heuristic.confidence >= 0.7) {
        return heuristic;
    }

    // Otherwise, use LLM for better accuracy
    if (useLLM) {
        const llmResult = await llmClassify(questionText, marks);
        if (llmResult) {
            return llmResult;
        }
    }

    // Fallback to heuristic or default
    return heuristic || { level: 2, confidence: 0.3, method: 'default', reasoning: 'No clear indicators' };
}

/**
 * Classify multiple questions in batch
 */
export async function classifyQuestions(questions) {
    const results = await Promise.all(
        questions.map(q => classifyQuestion(q.text || q.question, q.marks))
    );

    return results.map((result, i) => ({
        ...questions[i],
        bloomsLevel: result.level,
        bloomsConfidence: result.confidence,
        bloomsReasoning: result.reasoning,
        bloomsMethod: result.method
    }));
}

/**
 * Analyze Bloom's distribution for a paper
 */
export function analyzeBloomsDistribution(questions) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const marksByLevel = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    let totalMarks = 0;

    questions.forEach(q => {
        const level = q.bloomsLevel || 2; // Default to Understand
        distribution[level]++;
        marksByLevel[level] += q.marks || 0;
        totalMarks += q.marks || 0;
    });

    // Calculate percentages
    const percentageByLevel = {};
    for (let i = 1; i <= 6; i++) {
        percentageByLevel[i] = totalMarks > 0 ? (marksByLevel[i] / totalMarks * 100) : 0;
    }

    // Calculate weighted average cognitive level
    let weightedSum = 0;
    for (let i = 1; i <= 6; i++) {
        weightedSum += i * marksByLevel[i];
    }
    const avgCognitiveLevel = totalMarks > 0 ? weightedSum / totalMarks : 0;

    // Identify issues
    const issues = [];

    if (percentageByLevel[1] > 40) {
        issues.push({ type: 'warning', message: 'Over-reliance on Remember level (>40% of marks)' });
    }

    if (percentageByLevel[5] + percentageByLevel[6] < 10) {
        issues.push({ type: 'info', message: 'Limited higher-order thinking (Evaluate/Create <10%)' });
    }

    if (avgCognitiveLevel < 2.5) {
        issues.push({ type: 'warning', message: 'Average cognitive level is low (<2.5)' });
    }

    return {
        distribution,
        marksByLevel,
        percentageByLevel,
        avgCognitiveLevel,
        totalMarks,
        issues
    };
}

export const BLOOM_LEVELS = {
    1: { name: 'Remember', color: '#e5e7eb', description: 'Recall facts and basic concepts' },
    2: { name: 'Understand', color: '#dbeafe', description: 'Explain ideas and concepts' },
    3: { name: 'Apply', color: '#d1fae5', description: 'Use information in new situations' },
    4: { name: 'Analyze', color: '#fef3c7', description: 'Draw connections among ideas' },
    5: { name: 'Evaluate', color: '#fed7aa', description: 'Justify decisions and choices' },
    6: { name: 'Create', color: '#fecaca', description: 'Produce new or original work' }
};
