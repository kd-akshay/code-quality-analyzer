# CodeSage-Ai

## A code quality LLM analyzer

#### **Version:** 0.1.7s

### Introduction (Experimental)

Analyze the code quality of your React, Vue, and Angular projects using the power of Large Language Models (LLMs) for insightful suggestions, alongside planned integration for traditional linters.

**This tool is currently experimental.** LLM-based code analysis is an evolving field. Use the suggestions as a helpful guide and an augmentation to your existing code review processes, not as an infallible authority.

## Features

- **LLM-Powered Code Analysis:** Leverages a local LLM (via Ollama) to provide nuanced suggestions on:
  - Potential bugs and anti-patterns.
  - Code smells and areas for refactoring.
  - Readability and maintainability improvements.
  - Framework-specific best practices for React, Vue, and Angular.
- **Framework Support:** Identifies and analyzes files for:
  - React (`.jsx`, `.tsx`)
  - Angular (`.ts` component/service/module files, `.html` component templates)
- **File Traversal:** Automatically discovers relevant source files in your project.
- **Write Report:** Saves the report in a file with the same name but with a .txt extension.
- **Customizable LLM Model:** Specify which Ollama model to use.
- **Caching:** Speed up analysis for unchanged files.

**(Latest Fix)**

- **Prompt:** Refined prompt further resulting in minimise hallucination.

**(Planned Features)**

- **Traditional Linter Integration:** Combine LLM insights with reports from ESlint, Stylelint, and framework-specific linters.
- **Vue Support:** Supporting .vue files.
- **HTML/Markdown Report Generation:** Output reports in more shareable formats.
- **Configuration File:** Allow detailed customization of rules, paths, and models.

## Prerequisites

1.  **Node.js:** Version 18.0.0 or higher.
2.  **Ollama:** You must have [Ollama](https://ollama.com/) installed and running on your system.
3.  **Ollama LLM Model:** You need to have a suitable language model pulled into Ollama. Recommended models for code analysis:

    - `deepseek-coder-v2:16b` (default)
    - `codellama:13b-instruct` (or other Code Llama variants like 7b, 34b)
    - `llama3:8b` (or other Llama 3 variants)
    - `mistral` or `mixtral` variants

    You can pull a model using the Ollama CLI, for example:

    ```bash
    ollama serve
    ollama pull deepseek-coder-v2:16b
    ollama run deepseek-coder-v2:16b
    ```

    Ensure the Ollama application is running before using this analyzer.

## Installation

You can install the package locally as a development dependency in your project :

```bash
npm install --save-dev codesage-ai
# or
yarn add --dev codesage-ai
```

Alternatively, for global use (less common for project-specific tools):

```bash
npm install -g codesage-ai
```

## Usage

Once installed, you can run the analyzer from the root of your project directory.

Using npx (if installed locally ):

```bash
npx analyze-code [path_to_project]
```

If [path_to_project] is omitted, it defaults to the current directory (.).

Examples:

Analyze the current project:

```bash
npx analyze-code .
```

Analyze a specific sub-directory:

```bash
npx analyze-code ./src/app
```

Specifying the LLM Model:

You can specify which Ollama model to use via the OLLAMA_MODEL environment variable. If not set, it defaults to codellama:13b-instruct.

```bash
OLLAMA_MODEL=llama3:8b npx analyze-code .
# or for a larger model (will be slower, requires more resources)
OLLAMA_MODEL=codellama:34b-instruct npx analyze-code .
```

Adding to npm scripts (Recommended for local project usage):

Edit your project's package.json:

```bash
{
  "scripts": {
    "analyze:quality": "analyze-code .",
    "analyze:quality:deep": "OLLAMA_MODEL=deepseek-coder-v2:16b analyze-code ./src"
  }
}
```

Then run:

```bash
npm run analyze:quality
# or
npm run analyze:quality:deep
```

If installed globally:

```bash
analyze-code [path_to_project]
OLLAMA_MODEL=llama3:8b analyze-code .
```

## How it Works

File Discovery: The tool scans your project directory for relevant source files based on common extensions for React, Vue, and Angular.

LLM Prompting: For each identified file, its content is sent to the configured Ollama LLM with a carefully crafted prompt asking for code quality analysis, potential issues, and suggestions.

Report Generation: The LLM's responses are collected and presented in a consolidated report in your console.

## Contributing

This project is in its early stages, and contributions are welcome! If you have ideas, bug reports, or want to contribute code, please feel free to open an issue or a pull request on the GitHub repository. (Replace with your actual GitHub link once created).

## Areas for contribution:

Improving prompts for different frameworks and analysis types.

Integrating standard linting tools (ESLint, etc.).

Adding more sophisticated file filtering and framework detection.

Developing better report formats (HTML, Markdown).

Adding configuration options.

Writing tests.

## Disclaimer

The suggestions provided by the LLM are based on its training data and the prompt provided. They may not always be perfect, optimal, or cover all possible issues.

Always use your own judgment and conduct thorough code reviews. This tool is an assistant, not a replacement for human expertise.

Ensure your local Ollama setup and the models you use are from trusted sources.

Analyzing very large files or entire large projects can be resource-intensive and time-consuming due to LLM processing.

## License

MIT License
