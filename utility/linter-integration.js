import { ESLint } from "eslint";
import path from "path";
import chalk from "chalk";

const supportedExt = ['.js', '.jsx', '.ts', '.tsx',]

const getBaseEslintConfig = (fileType, filePath) => {
    const baseConfig = {
        baseConfig: {
            env: {
                browser: true,
                es2021: true,
                node: true,
            },
            extends: ['eslint:recommended'],
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            rules: {
                'no-console': 'off',
                'no-unused-vars': 'warn'
            }
        },
        //fix:true, //turn it on so it fixes while generating report
        //useEslintrc: true,// loads user's eslint file 

    }

    if (fileType === 'react') {
        baseConfig.baseConfig.extends.push('plugin:react/recommended');
        baseConfig.baseConfig.parserOptions = {
            ...baseConfig.baseConfig.parserOptions,
            ecmaFeatures: {
                jsx: true
            }
        };
        if (!baseConfig.baseConfig.settings) {
            baseConfig.baseConfig.settings = {};
        }
        baseConfig.baseConfig.settings.react = {
            version: 'detect' // Automatically detect React version from package.json
        };
        // baseConfig.baseConfig.parserOptions.ecmaFeatures = {
        //     jsx: true,
        // }
    } else if (fileType === 'angular' && !path.extname(filePath).endsWith('.html')) {
        baseConfig.baseConfig.extends.push('plugin:@angular-eslint/recommended');
        //baseConfig.baseConfig.plugins = ['@angular-eslint/eslint-plugin'];

        baseConfig.baseConfig.parser = "@typescript-eslint/parser";
        // And parserOptions for TypeScript
        baseConfig.baseConfig.parserOptions = {
            ...baseConfig.baseConfig.parserOptions,
            project: 'tsconfig.json', // Path to tsconfig.json in the analyzed project

            // tsconfigRootDir: path.dirname(filePath), 
        };
    } else if (fileType === 'vue') {
        baseConfig.baseConfig.extends.push('plugin:vue/vue3-recommended');
        baseConfig.baseConfig.parser = 'vue-eslint-parser';
        // And its own parserOptions
        baseConfig.baseConfig.parserOptions = {
            ...baseConfig.baseConfig.parserOptions,
            parser: '@babel/eslint-parser', // Or '@typescript-eslint/parser' if using TypeScript in Vue

        };
    }

    return baseConfig;
}

export const lintFile = async (filePath, fileType) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!supportedExt.includes(ext) || filePath.endsWith('.d.ts')) {
        // if (fileType === 'angular' && ext === '.html'){
        // }
        return [];
    }

    console.log(chalk.gray(`    Linting ${filePath} with ESlint...`));

    const eslintConfig = getBaseEslintConfig(fileType, filePath);
    const eslint = new ESLint(eslintConfig);


    try {

        const results = await eslint.lintFiles(filePath);

        const lintMessages = [];

        if (results && results.length > 0 && results[0].messages && results[0].messages.length > 0) {
            results[0].messages.forEach((message) => {
                lintMessages.push({
                    ruleId: message.ruleId,
                    severity: message.severity == 2 ? 'error' : 'warning',
                    message: message.message,
                    line: message.line,
                    column: message.column,
                })
            })
        }
        if (lintMessages.length > 0) {
            console.log(chalk.yellow(`  Found ${lintMessages.length} lint errors in ${filePath}`))
        } else {
            console.log(chalk.green(`  No lint errors found in ${filePath}`))
        }
        return lintMessages;

    } catch (err) {
        console.log(chalk.red(` ESlint error for ${filePath}: ${err.message}`))
        return [{
            ruleId: 'eslint-error',
            severity: 'error',
            message: err.message,
            line: 0,
            column: 0
        }];

    }
}