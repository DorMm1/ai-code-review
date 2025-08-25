import tl = require('azure-pipelines-task-lib/task');
import { encode } from 'gpt-tokenizer';
import fetch from 'node-fetch';

export class CustomModelApi {
    private readonly systemMessage: string = '';
    private readonly apiUrl: string;
    private readonly apiKey: string;

    constructor(apiUrl: string, apiKey: string, checkForBugs: boolean = false, checkForPerformance: boolean = false, checkForBestPractices: boolean = false, additionalPrompts: string[] = []) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.systemMessage = `Your task is to act as a code reviewer of a Pull Request:
        - Use bullet points if you have multiple comments.
        ${checkForBugs ? '- If there are any bugs, highlight them.' : null}
        ${checkForPerformance ? '- If there are major performance problems, highlight them.' : null}
        ${checkForBestPractices ? '- Provide details on missed use of best-practices.' : null}
        ${additionalPrompts.length > 0 ? additionalPrompts.map(str => `- ${str}`).join('\n') : null}
        - Do not highlight minor issues and nitpicks.
        - Only provide instructions for improvements 
        - If you have no instructions respond with NO_COMMENT only, otherwise provide your instructions.
    
        You are provided with the code changes (diffs) in a unidiff format.
        
        The response should be in markdown format.`
    }

    public async PerformCodeReview(diff: string, fileName: string): Promise<string> {
        if (!this.doesMessageExceedTokenLimit(diff + this.systemMessage, 4097)) {
            try {
                const response = await this.makeApiRequest(diff);
                return response;
            } catch (error) {
                tl.error(`Error calling custom model API: ${error}`);
                return '';
            }
        }

        tl.warning(`Unable to process diff for file ${fileName} as it exceeds token limits.`)
        return '';
    }

    private async makeApiRequest(diff: string): Promise<string> {
        const model = tl.getInput('ai_model', false);
        const requestBody: any = {
            messages: [
                {
                    role: 'system',
                    content: this.systemMessage
                },
                {
                    role: 'user',
                    content: diff
                }
            ]
        };
        if (model) {
            requestBody.model = model;
        }

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        
        if (responseData.choices && responseData.choices.length > 0) {
            return responseData.choices[0].message.content || '';
        } else if (responseData.content) {
            return responseData.content;
        } else if (responseData.response) {
            return responseData.response;
        } else if (typeof responseData === 'string') {
            return responseData;
        } else {
            const responseText = JSON.stringify(responseData);
            tl.warning(`Unexpected API response format. Raw response: ${responseText}`);
            return responseText;
        }
    }

    private doesMessageExceedTokenLimit(message: string, tokenLimit: number): boolean {
        let tokens = encode(message);
        return tokens.length > tokenLimit;
    }
}
