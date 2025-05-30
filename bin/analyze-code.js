#!/usr/bin/env node
import path from "path";
import fs from 'fs'
import { findProjectFiles } from "../utility/file-traversal.js";
import { analyzeFileWithLLM } from "../utility/llm-analyzer.js";
import { generateReport } from "../utility/report-generator.js";
import { lintFile } from "../utility/linter-integration.js";
import chalk from "chalk";

//const OLLAMA_MODEL_NAME = process.env.OLLAMA_MODEL || "codellama:13b-instruct"; // Or llama3, etc.
const OLLAMA_MODEL_NAME = process.env.OLLAMA_MODEL || "deepseek-coder-v2:16b";

async function main() {
  const projectPath = process.argv[2] || "."; // Default to current directory
  const absoluteProjectPath = path.resolve(projectPath);

  console.log(chalk.blue(`🔍 Analyzing project at: ${absoluteProjectPath}`));
  console.log(chalk.blue(`🧠 Using LLM: ${OLLAMA_MODEL_NAME}`));

  let filesToAnalyze = [];

  let stats = fs.statSync(absoluteProjectPath);
  if (!stats.isFile()) {
    filesToAnalyze = await findProjectFiles(absoluteProjectPath);

    if (filesToAnalyze.length === 0) {
      console.log(
        chalk.yellow(
          "No relevant files (React, Vue, Angular) found to analyze."
        )
      );
      return;
    }
  } else {
    filesToAnalyze = [absoluteProjectPath];
  }

  console.log(chalk.green(`Found ${filesToAnalyze.length} files to analyze.`));

  const analysisResults = [];

  for (const fileInfo of filesToAnalyze) {
    let filaAnalysis = {
      file: fileInfo.relativePath,
      lintingIssues: [],
      llmSuggestions: [],
      errors: [],
    };

    console.log(
      chalk.cyan(
        `\n--- Analyzing ${fileInfo.relativePath} (${fileInfo.type}) ---`
      )
    );
    try {
      // LLM Analysis
      const llmSuggestions = await analyzeFileWithLLM(
        fileInfo.fullPath,
        fileInfo.type,
        OLLAMA_MODEL_NAME
      );
      if (llmSuggestions) {
        filaAnalysis.llmSuggestions = llmSuggestions;
        // analysisResults.push({
        //     file: fileInfo.relativePath,
        //     type: 'llm-suggestion',
        //     suggestions: llmSuggestions
        // });
      }

      // Basic Linting
      // if (['.js', '.jsx', '.ts', '.tsx',].includes(path.extname(fileInfo.fullPath))) {
      //     try {
      //         const lintingIssues = await lintFile(fileInfo.fullPath, fileInfo.type);
      //         if (lintingIssues.length > 0) {
      //             filaAnalysis.lintingIssues = lintingIssues;
      //             //analysisResults.push({ file: fileInfo.relativePath, type: 'linting', issues: lintingIssues });
      //         }
      //     } catch (error) {
      //         filaAnalysis.lintingIssues = [error];
      //     }

      // }
      // const lintingIssues = await runLinters(fileInfo.fullPath, fileInfo.type);
      // analysisResults.push({ file: fileInfo.relativePath, type: 'linting', issues: lintingIssues });
    } catch (error) {
      console.error(
        chalk.red(`Error analyzing file ${fileInfo.relativePath}:`),
        error
      );
      filaAnalysis.errors.push(error);

      // analysisResults.push({
      //     file: fileInfo.relativePath,
      //     type: 'error',
      //     message: error.message
      // });
    }
    analysisResults.push(filaAnalysis);
  }

  console.log(chalk.blue("\n--- Generating Report ---"));
  generateReport(analysisResults, absoluteProjectPath);
  // console.log(report);
  //fs.writeFileSync(path.join(absoluteProjectPath, 'analysis-report.txt'), report);
  console.log(
    chalk.green(
      "\n✅ Analysis complete. The results have been saved in a file with the same name but with a '_report.md' extension."
    )
  );
}

main().catch((error) => {
  console.error(chalk.red("Unhandled error in analyzer:"), error);
  process.exit(1);
});
