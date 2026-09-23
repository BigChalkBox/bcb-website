import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export async function GET() {
    try {
        const docsDir = path.join(process.cwd(), 'docs');
        const guide = fs.readFileSync(path.join(docsDir, 'partner-api-integration-guide.md'), 'utf-8');
        const ref   = fs.readFileSync(path.join(docsDir, 'partner-api-reference.md'), 'utf-8');
        const combined = guide + '\n\n---\n\n' + ref;
        
        return new NextResponse(combined, {
            status: 200,
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        return new NextResponse('Error reading documentation', { status: 500 });
    }
}
