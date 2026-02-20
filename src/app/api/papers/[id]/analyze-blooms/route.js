import { NextResponse } from "next/server";
import { classifyQuestions, analyzeBloomsDistribution, BLOOM_LEVELS } from "@/lib/bloom-classifier";
import fs from "fs";
import path from "path";

const PAPERS_DIR = path.join(process.cwd(), "data", "papers");

export async function POST(req, { params }) {
    try {
        const { id } = params;
        const paperPath = path.join(PAPERS_DIR, `${id}.json`);

        if (!fs.existsSync(paperPath)) {
            return NextResponse.json({ error: "Paper not found" }, { status: 404 });
        }

        const paperData = JSON.parse(fs.readFileSync(paperPath, "utf-8"));

        if (!paperData.questions || paperData.questions.length === 0) {
            return NextResponse.json({
                error: "No questions found in paper"
            }, { status: 400 });
        }

        // Classify all questions
        console.log(`Classifying ${paperData.questions.length} questions...`);
        const classifiedQuestions = await classifyQuestions(paperData.questions);

        // Update paper data with Bloom's levels
        paperData.questions = classifiedQuestions;

        // Save updated paper
        fs.writeFileSync(paperPath, JSON.stringify(paperData, null, 2));

        // Analyze distribution
        const analysis = analyzeBloomsDistribution(classifiedQuestions);

        return NextResponse.json({
            success: true,
            questions: classifiedQuestions,
            analysis: {
                ...analysis,
                levels: BLOOM_LEVELS
            }
        });

    } catch (error) {
        console.error("Bloom's analysis error:", error);
        return NextResponse.json({
            error: "Failed to analyze Bloom's taxonomy",
            details: error.message
        }, { status: 500 });
    }
}

// GET endpoint to retrieve existing Bloom's analysis
export async function GET(req, { params }) {
    try {
        const { id } = params;
        const paperPath = path.join(PAPERS_DIR, `${id}.json`);

        if (!fs.existsSync(paperPath)) {
            return NextResponse.json({ error: "Paper not found" }, { status: 404 });
        }

        const paperData = JSON.parse(fs.readFileSync(paperPath, "utf-8"));

        if (!paperData.questions || paperData.questions.length === 0) {
            return NextResponse.json({
                error: "No questions found"
            }, { status: 400 });
        }

        // Check if questions have Bloom's levels
        const hasBloomsData = paperData.questions.some(q => q.bloomsLevel);

        if (!hasBloomsData) {
            return NextResponse.json({
                analyzed: false,
                message: "Paper has not been analyzed for Bloom's taxonomy yet"
            });
        }

        // Analyze distribution of existing data
        const analysis = analyzeBloomsDistribution(paperData.questions);

        return NextResponse.json({
            analyzed: true,
            questions: paperData.questions,
            analysis: {
                ...analysis,
                levels: BLOOM_LEVELS
            }
        });

    } catch (error) {
        console.error("Error retrieving Bloom's analysis:", error);
        return NextResponse.json({
            error: "Failed to retrieve analysis",
            details: error.message
        }, { status: 500 });
    }
}
