import fs from 'fs';
import path from 'path';

export const generateReport = (analysisResults, projectPath) => {
    let report = `
# Code Quality Analysis Report
Project Path: ${projectPath}
Date: ${new Date().toISOString()}
---
`;

    if (analysisResults.length === 0) {
        report += "No analysis results to display.\n";
        return report;
    }

    const filesAnalyzed = new Set(analysisResults.map(r => r.file));
    report += `**${filesAnalyzed.size} files were processed.**\n\n`;

    for (const result of analysisResults) {
        let localReport = report + `## File: ${result.file}\n`;
        if (!!result.llmSuggestions) {
            localReport += `### LLM Suggestions:\n`;
            localReport += `${result.llmSuggestions}\n`;
        }
        if (!!result.lintingIssues && result.lintingIssues.length > 0) {
            localReport += `### Linting Issues:\n`;

            result.lintingIssues.forEach(issue => {
                localReport += `- Line ${issue.line}, Col ${issue.column}: ${issue.message} (${issue.ruleId})\n`;
            });

        }
        if (!!result.errors && result.errors.length > 0) {
            localReport += `### Analysis Error:\n`;
            localReport += `  ${result.message}\n`;
        }
        localReport += "\n---\n";
        const flName = result.file.split('.')[0];
        fs.writeFileSync(path.join(projectPath, `${flName + '_report'}.md`), localReport);
    }
}