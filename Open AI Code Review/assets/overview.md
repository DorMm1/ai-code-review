# AI Code Review Bot for Azure DevOps

Automate pull request (PR) reviews in Azure DevOps using a custom AI model API. This bot analyzes code changes, offers suggestions, detects potential bugs, and ensures adherence to coding standards. Streamline code reviews with customizable criteria and natural language feedback, improving code quality and reducing review time.

## Key Features

- **Automated PR Reviews**: Leverage your custom AI model to analyze code changes in pull requests.
- **Code Quality Suggestions**: Detect potential issues and ensure best practices are followed.
- **Customizable Review Criteria**: Tailor the bot to specific code quality metrics.
- **Azure DevOps Integration**: Seamlessly integrates with existing DevOps pipelines.
- **Natural Language Feedback**: Provides human-readable, actionable feedback.

## Use Cases

- **Automate Routine PR Tasks**: Speed up the code review process by automating common review tasks.
- **Improve Code Quality**: Receive consistent, detailed feedback to enhance code quality.
- **Early Bug Detection**: Help developers understand best practices and identify bugs early in the development cycle.

## Prerequisites

- A custom AI model API endpoint
- An API key for your custom AI model

## Getting Started

1. **Install the AI Code Review DevOps Extension**

   Install the AI Code Review DevOps extension from the Azure DevOps Marketplace.

2. **Add the AI Code Review Task to Your Pipeline**

   Add the following YAML snippet to your pipeline configuration to set up the AI code review task:

   ```yaml
   trigger:
     branches:
       exclude:
         - '*'

   pr:
     branches:
       include:
         - '*'

   jobs:
     - job: CodeReview
       pool:
         vmImage: 'ubuntu-latest'
       steps:
         - checkout: self
           persistCredentials: true
         - task: AICodeReview@1
           inputs:
             api_url: $(CustomAI_ApiUrl)
             api_key: $(CustomAI_ApiKey)
             bugs: true
             performance: true
             best_practices: true
             file_extensions: '.js,.ts,.py,.java'
             additional_prompts: 'Check for security vulnerabilities, Ensure proper error handling'
   ```

## Configuration

The task requires the following inputs:

- **api_url**: The endpoint URL for your custom AI model API
- **api_key**: API key for your custom AI model (sent as Bearer token)
- **bugs**: Enable/disable bug checking (default: true)
- **performance**: Enable/disable performance checking (default: true)
- **best_practices**: Enable/disable best practices checking (default: true)
- **file_extensions**: Comma-separated list of file extensions to review
- **file_excludes**: Comma-separated list of files to exclude from review
- **additional_prompts**: Custom prompts to include in the review process

## FAQ

### Q: What permissions are required for Build Administrators?

A: Build Administrators must be given "Contribute to pull requests" access. Check [this Stack Overflow answer](https://stackoverflow.com/a/57985733) for guidance on setting up permissions.

### Q: What format should my custom AI model API expect?

A: Your API should expect a POST request with a JSON body containing:
- `messages`: Array with system and user messages
- The system message contains the review instructions
- The user message contains the code diff to review

Your API should return a response with the review content in one of these formats:
- `choices[0].message.content` (OpenAI-compatible format)
- `content` (direct content field)
- `response` (response field)
- Plain text string

## Resources
- [Marketplace Pipeline Extension](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-build-task?toc=%2Fazure%2Fdevops%2Fmarketplace-extensibility%2Ftoc.json&view=azure-devops)
- [Publisher Portal](https://marketplace.visualstudio.com/manage/publishers)