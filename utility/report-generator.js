
export const generateReport=(analysisResults, projectPath)=> {
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
        report += `## File: ${result.file}\n`;
        if (result.type === 'llm-suggestion') {
            report += `### LLM Suggestions:\n`;
            report += `${result.suggestions}\n`;
        } else if (result.type === 'linting') { // If you implement this
            report += `### Linting Issues:\n`;
            if (result.issues && result.issues.length > 0) {
                result.issues.forEach(issue => {
                    report += `- Line ${issue.line}, Col ${issue.column}: ${issue.message} (${issue.ruleId})\n`;
                });
            } else {
                report += "No linting issues found.\n";
            }
        } else if (result.type === 'error') {
            report += `### Analysis Error:\n`;
            report += `  ${result.message}\n`;
        }
        report += "\n---\n";
    }
    return report;
}