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
        useEslintrc: true,// loads user's eslint file 

    }

    if (fileType === 'react') {
        baseConfig.baseConfig.extends.push('plugin:react/recommended');
        baseConfig.baseConfig.parserOptions = {
            ...baseConfig.baseConfig.parserOptions,
            ecmaFeatures: {
                jsx: true
            }
        };
        // baseConfig.baseConfig.parserOptions.ecmaFeatures = {
        //     jsx: true,
        // }
    } else if (fileType === 'angular' && !path.extname(filePath).endsWith('.html')) {
        baseConfig.baseConfig.extends.push('plugin:@angular-eslint/recommended');
        //baseConfig.baseConfig.plugins = ['@angular-eslint/eslint-plugin'];
        //baseConfig.baseConfig.parse = "@typescript-eslint/parser";
    } else if (fileType === 'vue') {
        baseConfig.baseConfig.extends.push('plugin:vue/vue3-recommended');
    }

    return baseConfig;
}

export const lintFile = async (filePath, fileType) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!supportedExt.includes(ext) || filePath.ecmaFeatures('.d.ts')) {
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