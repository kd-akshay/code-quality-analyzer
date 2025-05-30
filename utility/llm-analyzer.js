
import fs from 'fs/promises';
import { Ollama } from 'ollama';
import chalk from 'chalk';
import NodeCache from 'node-cache';
//import crypto from 'crypto';
//import { createHmac } from 'node:crypto';
import crypto from 'node:crypto';

const ollama = new Ollama({ host: 'http://localhost:11434' });

const llmCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// need prompt engineer for better prompt
export const getLLMPrompt = (fileContent, fileType) => {
    let frameworkSpecifics = "";

    const isLikelySimple = fileContent.split('\n').length < 30 && !fileContent.match(/useEffect|useState|useReducer|class |constructor|async |await |fetch|axios|service/i);

    if (fileType === 'react') {
        frameworkSpecifics = `Consider React best practices. For simple components, focus on JSX structure, prop usage, and basic readability. For more complex components, also consider hooks usage (useState, useEffect, useReducer, useContext, custom hooks), component composition, state management patterns, and performance (memoization, avoiding unnecessary re-renders, virtual DOM impact).`;
    } else if (fileType === 'vue') {
        frameworkSpecifics = `Consider Vue.js best practices. For simple components, focus on template syntax and basic script setup. For more complex components, also consider the Composition API or Options API structure, reactivity system, component lifecycle, props and events, and single-file component structure.`;
    } else if (fileType === 'angular') {
        frameworkSpecifics = `Consider Angular best practices. For simple templates or components, focus on template syntax, bindings, and basic component structure. For more complex ones, also consider component architecture, module organization, dependency injection, RxJS usage, change detection, and services.`;
    }

    let introStatement = `You are an expert code quality and linting assistant.
Analyze the following ${fileType} code snippet based *solely on the provided code*.
Do NOT assume the existence of external APIs, complex state, or user interactions unless explicitly shown in the code.`;

    if (isLikelySimple) {
        introStatement += `
The provided code appears to be relatively simple. Focus your analysis on fundamental correctness, readability, and adherence to basic ${fileType} syntax. Many advanced topics (like complex state management, intricate performance optimizations, or security vulnerabilities related to data handling/APIs) may not be applicable. If they are not, simply state that they are not relevant for this snippet.`;
    }

    return `
${introStatement}

Provide a brief report focusing on:
1.  **Potential Bugs or Anti-patterns:** Identify any code that might lead to errors or follows common anti-patterns for ${fileType}. If the code is too simple for complex anti-patterns, focus on basic correctness.
2.  **Code Smells:** Point out areas that might indicate deeper problems (e.g., overly complex functions if present, long methods, tight coupling, poor naming). For simple code, this might be minimal or not applicable.
3.  **Readability & Maintainability:** Suggest improvements for clarity, commenting (if appropriate for the complexity), and structure.
4.  **Performance Considerations:** (Only if complex logic, loops, or data manipulation is present, or if specific ${fileType} performance patterns are relevant and evident). Do not invent performance issues for simple static content.
5.  **Security Vulnerabilities:** (Only if there's obvious handling of user input directly into HTML (XSS) or other clear vulnerabilities within the snippet itself). Do not assume external security contexts like API key handling unless shown.

${frameworkSpecifics}

Be concise and provide actionable suggestions directly related to the provided code.
Format your response clearly, using markdown if it helps.
Do NOT include the original code in your response. Focus ONLY on the analysis and suggestions.
If you can suggest revised code for a specific issue, please provide a snippet.
If, after careful analysis based on the code's actual complexity, there are no significant issues, or the issues are very minor for a simple component, clearly state that. For example: "The code is a simple, well-structured ${fileType} component with no major issues identified." or "The code appears to be of good quality. Minor suggestion: [...]"

Code to Analyze:
\`\`\`${fileType === 'vue' ? 'html' : (fileType === 'angular' && fileContent.startsWith('<')) ? 'html' : 'typescript'}
${fileContent}
\`\`\`

Your Analysis:
`;
}

export const analyzeFileWithLLM = async (filePath, fileType, modelName) => {
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

    // check for very large files to avoid long processing
    if (fileContent.length > 20000) { // Approx 20k characters
        console.warn(chalk.yellow(`File ${filePath} is very large (${fileContent.length} chars) and might be skipped or take a long time for LLM analysis.`));
        // return "File is too large for detailed LLM analysis in this pass.";
    }


    const prompt = getLLMPrompt(fileContent, fileType);

    const fileContentHash = crypto.createHash('md5').update(fileContent).digest('hex');
    const cacheKey = `${filePath}-${fileType}-${modelName}-${fileContentHash}`;

    const cachedResponse = llmCache.get(cacheKey);
    if (cachedResponse) {
        console.log(chalk.blue(` Using cached LLM response for ${filePath}`));
        return cachedResponse;
    }

    try {
        console.log(chalk.gray(`  Sending to LLM (${modelName})... This may take a moment.`));
        const response = await ollama.generate({
            model: modelName,
            prompt: prompt,
            stream: false,
            // options: { temperature: 0.3 } // takes more time but better results
        });
        console.log(chalk.gray(`  LLM response received for ${filePath}`));

        const llmResponse = response.response.trim();
        llmCache.set(cacheKey, llmResponse);

        return llmResponse;
    } catch (error) {
        console.error(chalk.red(`Error during LLM analysis for ${filePath}:`), error.message);
        if (error.message.includes('ECONNREFUSED')) {
            throw new Error("Ollama connection refused. Is Ollama running at http://localhost:11434?");
        }
        return `LLM analysis failed: ${error.message}`;
    }
}

