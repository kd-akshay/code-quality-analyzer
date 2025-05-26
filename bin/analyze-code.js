#!/usr/bin/env node



import path from 'path';
import {findProjectFiles} from '../utility/file-traversal.js';
import {analyzeFileWithLLM} from '../utility/llm-analyzer.js';
import {generateReport} from '../utility/report-generator.js'
import chalk from 'chalk';


const OLLAMA_MODEL_NAME = process.env.OLLAMA_MODEL || "codellama:13b-instruct"; // Or llama3, etc.

async function main() {
    const projectPath = process.argv[2] || '.'; // Default to current directory
    const absoluteProjectPath = path.resolve(projectPath);

    console.log(chalk.blue(`🔍 Analyzing project at: ${absoluteProjectPath}`));
    console.log(chalk.blue(`🧠 Using LLM: ${OLLAMA_MODEL_NAME}`));


    const filesToAnalyze = await findProjectFiles(absoluteProjectPath);

    if (filesToAnalyze.length === 0) {
        console.log(chalk.yellow("No relevant files (React, Vue, Angular) found to analyze."));
        return;
    }

    console.log(chalk.green(`Found ${filesToAnalyze.length} files to analyze.`));

    const analysisResults = [];

    for (const fileInfo of filesToAnalyze) {
        console.log(chalk.cyan(`\n--- Analyzing ${fileInfo.relativePath} (${fileInfo.type}) ---`));
        try {
            // Basic Linting (Conceptual - would need real integration)
            // const lintingIssues = await runLinters(fileInfo.fullPath, fileInfo.type);
            // analysisResults.push({ file: fileInfo.relativePath, type: 'linting', issues: lintingIssues });

            // LLM Analysis
            const llmSuggestions = await analyzeFileWithLLM(fileInfo.fullPath, fileInfo.type, OLLAMA_MODEL_NAME);
            if (llmSuggestions) {
                analysisResults.push({
                    file: fileInfo.relativePath,
                    type: 'llm-suggestion',
                    suggestions: llmSuggestions
                });
            }
        } catch (error) {
            console.error(chalk.red(`Error analyzing file ${fileInfo.relativePath}:`), error);
            analysisResults.push({
                file: fileInfo.relativePath,
                type: 'error',
                message: error.message
            });
        }
    }

    console.log(chalk.blue("\n--- Generating Report ---"));
    const report = generateReport(analysisResults, absoluteProjectPath);
    console.log(report); // For now, just log to console. Could write to file.

    console.log(chalk.green("\n✅ Analysis Complete."));
}

main().catch(error => {
    console.error(chalk.red("Unhandled error in analyzer:"), error);
    process.exit(1);
});