// const fs = require('fs').promises;
import fs from 'fs/promises';
import { Ollama } from 'ollama';
import chalk from 'chalk';
// const Ollama = require('ollama').Ollama;
// const chalk = require('chalk');

const ollama = new Ollama({ host: 'http://localhost:11434' }); // Ensure Ollama is running

// More sophisticated prompt engineering is crucial here
export const getLLMPrompt=(fileContent, fileType)=> {
    let frameworkSpecifics = "";
    if (fileType === 'react') {
        frameworkSpecifics = "Consider React best practices like hooks usage, component composition, state management (useState, useReducer, context), and performance (memoization, virtual DOM impact).";
    } else if (fileType === 'vue') {
        frameworkSpecifics = "Consider Vue.js best practices including the Composition API or Options API structure, reactivity system, component lifecycle, props and events, and single-file component structure.";
    } else if (fileType === 'angular') {
        frameworkSpecifics = "Consider Angular best practices such as component architecture, module organization, dependency injection, RxJS usage, change detection, and template syntax. For .html files, focus on template structure and bindings.";
    }

    return `
You are an expert code quality and linting assistant.
Analyze the following ${fileType} code snippet.
Provide a brief report focusing on:
1.  **Potential Bugs or Anti-patterns:** Identify any code that might lead to errors or follows common anti-patterns for ${fileType}.
2.  **Code Smells:** Point out areas that might indicate deeper problems (e.g., overly complex functions, long methods, tight coupling, poor naming).
3.  **Readability & Maintainability:** Suggest improvements for clarity, commenting, and structure.
4.  **Performance Considerations:** (If applicable) Highlight any obvious performance bottlenecks or areas for optimization specific to ${fileType}.
5.  **Security Vulnerabilities:** (If applicable and obvious) Point out any common security flaws like XSS vectors in templates, or improper data handling.

${frameworkSpecifics}

Be concise and provide actionable suggestions. If the code looks good, state that.
Format your response clearly, using markdown if it helps.
Do NOT include the original code in your response. Focus ONLY on the analysis and suggestions.
If there are no significant issues, you can say "The code appears to be of good quality with no major issues identified."

Code to Analyze:
\`\`\`${fileType === 'vue' ? 'html' : (fileType === 'angular' && fileContent.startsWith('<')) ? 'html' : 'typescript'}
${fileContent}
\`\`\`

Your Analysis:
`;
}

export const analyzeFileWithLLM=async(filePath, fileType, modelName) =>{
    let fileContent;
    try {
        fileContent = await fs.readFile(filePath, 'utf-8');
    } catch (readError) {
        console.error(chalk.yellow(`Could not read file ${filePath}: ${readError.message}`));
        return `Error reading file: ${readError.message}`;
    }

    if (fileContent.trim().length === 0) {
        console.log(chalk.gray(`Skipping empty file: ${filePath}`));
        return "File is empty.";
    }

    // Crude check for very large files to avoid overwhelming LLM or long processing
    if (fileContent.length > 20000) { // Approx 20k characters
        console.warn(chalk.yellow(`File ${filePath} is very large (${fileContent.length} chars) and might be skipped or take a long time for LLM analysis.`));
        // return "File is too large for detailed LLM analysis in this pass.";
    }


    const prompt = getLLMPrompt(fileContent, fileType);

    try {
        console.log(chalk.gray(`  Sending to LLM (${modelName})... This may take a moment.`));
        const response = await ollama.generate({
            model: modelName,
            prompt: prompt,
            stream: false,
            // options: { temperature: 0.3 } // For more deterministic output
        });
        console.log(chalk.gray(`  LLM response received for ${filePath}`));
        return response.response.trim();
    } catch (error) {
        console.error(chalk.red(`Error during LLM analysis for ${filePath}:`), error.message);
        if (error.message.includes('ECONNREFUSED')) {
            throw new Error("Ollama connection refused. Is Ollama running at http://localhost:11434?");
        }
        return `LLM analysis failed: ${error.message}`;
    }
}

