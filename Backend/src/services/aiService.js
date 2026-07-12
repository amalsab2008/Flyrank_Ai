const fs = require('fs');

class AiService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'gemini';
    this.model = process.env.AI_MODEL || 'gemini-1.5-flash';
    this.timeoutMs = parseInt(process.env.AI_TIMEOUT_MS || '8000', 10);

    // Pricing rates per token (USD)
    this.rates = {
      'gemini-1.5-flash': { input: 0.000000075, output: 0.0000003 },
      'llama3-8b-8192': { input: 0.00000005, output: 0.00000008 },
      default: { input: 0, output: 0 }
    };
  }

  async extractTasks(rawText) {
    const systemPrompt = `You are a structured task extraction system. Analyze the user's input and extract a list of actionable tasks.
Return a valid JSON array of objects. Each object MUST have:
- "title": string (the action or task description, clean and summarized)
- "completed": boolean (always false by default)

Do NOT include any markdown markup, explanation, or HTML formatting. Return only the raw JSON.
Example output:
[{"title": "Buy groceries", "completed": false}, {"title": "Reply to manager email", "completed": false}]`;

    let responseText;
    let tokens = { input: 0, output: 0 };

    if (this.provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('Gemini API key is not configured in .env');
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nUser Input: "${rawText}"` }]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      };

      const resJson = await this._fetchWithRetryAndTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resJson.candidates || !resJson.candidates[0]) {
        throw new Error('Invalid response from Gemini API: ' + JSON.stringify(resJson));
      }

      responseText = resJson.candidates[0].content.parts[0].text;
      if (resJson.usageMetadata) {
        tokens.input = resJson.usageMetadata.promptTokenCount || 0;
        tokens.output = resJson.usageMetadata.candidatesTokenCount || 0;
      }

    } else if (this.provider === 'groq') {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey || apiKey === 'your_groq_api_key_here') {
        throw new Error('Groq API key is not configured in .env');
      }

      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const payload = {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: rawText }
        ],
        response_format: { type: 'json_object' }
      };

      const resJson = await this._fetchWithRetryAndTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!resJson.choices || !resJson.choices[0]) {
        throw new Error('Invalid response from Groq API: ' + JSON.stringify(resJson));
      }

      responseText = resJson.choices[0].message.content;
      if (resJson.usage) {
        tokens.input = resJson.usage.prompt_tokens || 0;
        tokens.output = resJson.usage.completion_tokens || 0;
      }

    } else if (this.provider === 'ollama') {
      const url = 'http://localhost:11434/api/generate';
      const payload = {
        model: this.model,
        prompt: `${systemPrompt}\n\nUser Input: "${rawText}"`,
        format: 'json',
        stream: false
      };

      const resJson = await this._fetchWithRetryAndTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      responseText = resJson.response;
      tokens.input = resJson.prompt_eval_count || 0;
      tokens.output = resJson.eval_count || 0;

    } else {
      throw new Error(`Unsupported AI provider: ${this.provider}`);
    }

    // Validate structured output
    let parsedTasks;
    try {
      parsedTasks = JSON.parse(responseText);
      // If it parsed a single object instead of array, wrap it
      if (parsedTasks && !Array.isArray(parsedTasks)) {
        if (parsedTasks.tasks && Array.isArray(parsedTasks.tasks)) {
          parsedTasks = parsedTasks.tasks;
        } else {
          parsedTasks = [parsedTasks];
        }
      }
    } catch (e) {
      console.warn('AI returned malformed JSON. Output:', responseText);
      throw new Error('Model failed to output structured JSON: ' + e.message);
    }

    // Log tokens and cost estimation
    this._logCost(tokens.input, tokens.output);

    return parsedTasks;
  }

  _logCost(inputTokens, outputTokens) {
    const rate = this.rates[this.model] || this.rates.default;
    const inputCost = inputTokens * rate.input;
    const outputCost = outputTokens * rate.output;
    const totalCost = inputCost + outputCost;

    console.log(`[AI SERVICE COST REPORT] Feature: task_extraction | Model: ${this.model} | Provider: ${this.provider}`);
    console.log(`- Input Tokens: ${inputTokens} (Cost: $${inputCost.toFixed(6)})`);
    console.log(`- Output Tokens: ${outputTokens} (Cost: $${outputCost.toFixed(6)})`);
    console.log(`- Estimated Total Cost: $${totalCost.toFixed(6)}`);
  }

  async _fetchWithRetryAndTimeout(url, options, maxRetries = 2, delayMs = 1000) {
    let attempt = 0;
    
    while (true) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          return await response.json();
        }

        const statusCode = response.status;
        const errorText = await response.text();

        // Fail fast: do not retry 400 (Bad Request) or 401/403 (Auth Errors)
        if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
          throw new Error(`AI API failed with status ${statusCode} (Client Error): ${errorText}`);
        }

        // Retry on 429 (Rate Limit) and 5xx (Server Error)
        if (attempt <= maxRetries && (statusCode === 429 || statusCode >= 500)) {
          console.warn(`AI API returned status ${statusCode}. Retrying attempt ${attempt}/${maxRetries} in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs *= 2; // Exponential backoff
          continue;
        }

        throw new Error(`AI API failed with status ${statusCode}: ${errorText}`);

      } catch (err) {
        clearTimeout(timeoutId);
        
        if (err.name === 'AbortError') {
          if (attempt <= maxRetries) {
            console.warn(`AI API request timed out after ${this.timeoutMs}ms. Retrying attempt ${attempt}/${maxRetries} in ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            delayMs *= 2;
            continue;
          }
          throw new Error(`AI API request timed out after ${this.timeoutMs}ms.`);
        }
        
        if (attempt <= maxRetries) {
          console.warn(`AI API request failed: ${err.message}. Retrying attempt ${attempt}/${maxRetries} in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs *= 2;
          continue;
        }

        throw err;
      }
    }
  }
}

module.exports = AiService;
