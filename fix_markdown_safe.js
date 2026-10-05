import fs from 'fs';

function fixFile(filename) {
    let lines = fs.readFileSync(filename, 'utf8').split('\n');
    let inCode = false;
    let outLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let trimmed = line.trim();
        
        if (trimmed.startsWith('```')) {
            if (!inCode) {
                // Opening tag
                inCode = true;
                if (trimmed === '```') {
                    // It's empty. Look ahead to guess language
                    let nextLine = '';
                    for (let j = i + 1; j < lines.length; j++) {
                        if (lines[j].trim() !== '') {
                            nextLine = lines[j].trim();
                            break;
                        }
                    }
                    
                    if (nextLine.startsWith('curl') || nextLine.startsWith('export ') || nextLine.startsWith('#!') || nextLine.startsWith('T=$(') || nextLine.startsWith('while :')) {
                        line = '```bash';
                    } else if (nextLine.startsWith('{') || nextLine.startsWith('[') || nextLine.startsWith('HTTP/1.1')) {
                        line = '```json';
                    } else if (nextLine.includes('POST /assignments/{id}/submissions') && nextLine.includes('auto_grade')) {
                        // This is the ASCII diagram that I should replace with Mermaid
                        line = '```mermaid\nflowchart TD\n    sub[Answer Sheet PDF] -- "POST /assignments/{id}/submissions <br/> (auto_grade=true)" --> queued[QUEUED]\n    sub -- "POST /assignments/{id}/submissions <br/> (auto_grade=false)" --> submitted[SUBMITTED]\n    \n    queued -- "submission.received webhook" --> queued\n    queued -- "grading worker claims it" --> proc[PROCESSING]\n    \n    submitted -- "POST /submissions/{id}/grade" --> queued\n    \n    proc --> eval[EVALUATED]\n    proc --> err[ERROR]\n    \n    eval -- "grading.completed webhook <br/> (or poll GET /submissions/{id})" --> done((Done))\n    err -- "grading.failed webhook <br/> (or poll GET /submissions/{id})" --> done';
                        // Skip the rest of the ascii art
                        while (i + 1 < lines.length && !lines[i + 1].trim().startsWith('```')) {
                            i++;
                        }
                    } else if (nextLine.includes('your servers') && nextLine.includes('BigChalkBox')) {
                        // The other ASCII diagram
                        line = '```mermaid\ngraph TD\n    subscript_your[your servers]\n    subscript_bcb[BigChalkBox]\n\n    subgraph your servers\n        backend[integration backend <br/> X-API-Key]\n    end\n\n    subgraph BigChalkBox\n        nginx[nginx <br/> TLS + per-key rate limit 20 r/s]\n        api[partner-api <br/> FastAPI :8004 <br/> webhook outbox]\n        db[(partner-db <br/> your tests, submissions, students)]\n        worker[evaluator worker <br/> AI grading]\n        \n        nginx --> api\n        api <--> db\n        worker -- "polls the queue, claims QUEUED rows" --> db\n        worker -. "segmentation → per-question AI grading → report" .-> worker\n    end\n\n    backend -- "HTTPS" --> nginx\n    api -- "signed webhook POSTs <br/> submission.received, grading.completed, grading.failed" --> backend';
                        while (i + 1 < lines.length && !lines[i + 1].trim().startsWith('```')) {
                            i++;
                        }
                    } else {
                        // HMAC or step-by-step
                        line = '```prose';
                    }
                }
            } else {
                // Closing tag
                inCode = false;
            }
        }
        outLines.push(line);
    }
    fs.writeFileSync(filename, outLines.join('\n'));
    console.log(`Safely fixed ${filename}`);
}

fixFile('docs/partner-api-reference.md');
fixFile('docs/partner-api-integration-guide.md');
