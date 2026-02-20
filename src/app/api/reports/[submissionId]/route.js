import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req, { params }) {
    try {
        const { submissionId } = await params;

        // Fetch evaluation data
        const { data: evalData, error: evalError } = await supabase
            .from("evaluations")
            .select("evaluation_results, result, submission_id")
            .eq("submission_id", submissionId)
            .single();

        if (evalError) {
            console.error("Evaluation fetch error:", evalError);
            throw evalError;
        }

        // Fetch submission data separately
        const { data: submissionData, error: submissionError } = await supabase
            .from("submissions")
            .select("id, student_name, enrollment_no, email, paper_name, submitted_at, paper_id")
            .eq("id", submissionId)
            .single();

        if (submissionError) {
            console.error("Submission fetch error:", submissionError);
            throw submissionError;
        }

        const report =
            typeof evalData.evaluation_results === "string"
                ? JSON.parse(evalData.evaluation_results)
                : evalData.evaluation_results;

        const detectionResult =
            typeof evalData.result === "string"
                ? JSON.parse(evalData.result)
                : evalData.result;

        const submission = submissionData;

        // Fetch paper data
        const { data: paperDataRes, error: paperError } = await supabase
            .from("papers")
            .select("paper_data")
            .eq("id", submission.paper_id)
            .single();

        if (paperError) {
            console.error("Paper fetch error:", paperError);
            throw paperError;
        }

        const paperData =
            typeof paperDataRes.paper_data === "string"
                ? JSON.parse(paperDataRes.paper_data)
                : paperDataRes.paper_data;

        // Calculate totals
        let totalScore = 0;
        let totalMarks = 0;
        const processedIndices = new Set();

        for (let i = 0; i < report.results.length; i++) {
            if (processedIndices.has(i)) continue;
            const q = report.results[i];

            // Check if this is an OR question
            const paperQ = paperData?.questions?.find(pq => pq.qid === q.qid);

            if (paperQ?.isOr && i + 1 < report.results.length) {
                const nextQ = report.results[i + 1];
                processedIndices.add(i + 1);

                // Use attempted question's score
                const q1Attempted = q.studentImages?.length > 0;
                const q2Attempted = nextQ.studentImages?.length > 0;
                const attemptedQ = q1Attempted ? q : (q2Attempted ? nextQ : q);

                totalScore += attemptedQ.evaluation?.suggestedScore ?? 0;
                totalMarks += attemptedQ.marks;
            } else {
                totalScore += q.evaluation?.suggestedScore ?? 0;
                totalMarks += q.marks;
            }
        }

        return NextResponse.json({
            submission,
            report,
            detectionResult,
            paperData,
            totalScore,
            totalMarks,
        });
    } catch (error) {
        console.error("Error fetching report:", error);
        return NextResponse.json(
            { error: "Failed to fetch report", details: error.message },
            { status: 500 }
        );
    }
}
