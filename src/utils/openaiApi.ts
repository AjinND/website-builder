import axios from 'axios';
import { AIModelProvider, AIModelRequest, AIModelResponse, AIModelConfig } from '@/types/types';

// Define the base API endpoints
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const GROK_BASE_URL = 'https://api.grok.ai/v1';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

// The comprehensive prompt for generating Next.js code from design JSON
const NEXTJS_GENERATION_PROMPT = `
As a senior full-stack engineer, your task is to generate a fully functional, production-ready Next.js application (using the latest stable version and React 18+) that dynamically interprets a provided design JSON to create pages, components, and layouts. The application must be styled with Tailwind CSS, follow best practices for responsiveness, and avoid any hardcoded positions or sizes. The goal is to create a flexible system where the app's structure and styling are inferred entirely from the JSON data, ensuring it can adapt to different designs without modifying the code.

Requirements:

Dynamic JSON Parsing:
The application should parse the provided JSON to identify:
- Page routes (e.g., "index", "about").
- Component types (e.g., "navbar", "container", "heading", "card", "footer").
- Component properties (e.g., "content", "backgroundColor", "textColor").
- Nested components (e.g., a "container" component containing other components like "heading" or "card").
The JSON will define the structure of the pages, including which components are used and how they are nested or arranged.

File and Folder Structure:
Use Next.js conventions:
- pages/ for dynamically generated routes based on the JSON (e.g., index.js, about.js).
- components/ for reusable, dynamically generated components (e.g., Navbar.jsx, Container.jsx, Heading.jsx, Card.jsx, Footer.jsx).
- public/ for static assets (use any image URLs directly from the JSON).
- styles/ for global CSS and Tailwind configuration.
The app should automatically generate the necessary files based on the JSON without hardcoding specific components or pages.

Component Generation:
- Create a system where components are dynamically rendered based on the JSON's "type" field.
- Each component should accept props derived from the JSON (e.g., content, backgroundColor, textColor).
- Use PropTypes or TypeScript for type safety in components.
- Components should be reusable and styled using Tailwind CSS utility classes.

Layout and Responsiveness:
- Use Tailwind's flexbox and grid utilities to create responsive layouts.
- Infer layout relationships from the JSON structure (e.g., components in an array should be rendered in a row or column based on their types).
- Avoid using any hardcoded positions, widths, or heights from the JSON. Instead, let Tailwind's responsive classes handle the layout (e.g., flex, grid, sm:, md:, lg:).
- Ensure the layout adapts to different screen sizes (e.g., stack components vertically on mobile, arrange in rows on larger screens).

Page Generation:
- Dynamically generate pages based on the JSON. For example, if the JSON specifies a "page" field or links in the navbar, create corresponding pages (e.g., index.js, about.js).
- Each page should render the components specified in the JSON for that page, using a dynamic component mapping system.

Styling:
- Use Tailwind CSS for all styling, ensuring the app is fully responsive.
- Apply styles dynamically based on the JSON properties (e.g., backgroundColor, textColor).
- Avoid inline styles or hardcoded CSS; rely on Tailwind's utility classes.

Output Format:
- First, display the generated file/folder tree based on the JSON.
- Then, provide the code for each generated file in fenced code blocks (e.g., jsx, js, css).
- Include a package.json with all necessary dependencies and scripts.
- End with instructions to run the app: bash npm install && npm run dev.

Additional Considerations:
- Ensure the app is production-ready, with proper configuration for Next.js, Tailwind, and any other dependencies.
- The system should be extensible, allowing new component types to be added easily by updating the component mapping.
- Handle nested components (e.g., a "container" component that contains other components like "heading" or "card").
`;

// Payload and response handling functions
const formatOpenAIPayload = (designData: any, model: string) => ({
  model,
  messages: [
    {
      role: 'system',
      content: NEXTJS_GENERATION_PROMPT
    },
    {
      role: 'user',
      content: `JSON Data of the Design:\`json\n${JSON.stringify(designData, null, 2)}\n\``
    }
  ],
  temperature: 0.7,
  max_tokens: 8000
});

const parseOpenAIResponse = (response: any) => response.data.choices[0].message.content;

const formatGeminiPayload = (designData: any, model: string) => ({
  contents: [
    {
      parts: [
        {
          text: `${NEXTJS_GENERATION_PROMPT}\n\nJSON Data of the Design:\n${JSON.stringify(designData, null, 2)}`
        }
      ]
    }
  ]
});

const parseGeminiResponse = (response: any) => {
  const candidate = response.data.candidates[0];
  if (candidate && candidate.content && candidate.content.parts && candidate.content.parts[0]) {
    return candidate.content.parts[0].text;
  }
  throw new Error("Invalid response from Gemini API");
};

/**
 * Configuration for different AI models
 */
const AI_MODEL_CONFIG: Record<AIModelProvider, AIModelConfig> = {
  [AIModelProvider.GEMINI]: {
    baseUrl: GEMINI_BASE_URL,
    defaultModel: 'gemini-2.5-pro-preview-03-25',
    apiKeyEnvVar: 'GEMINI_API_KEY',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatPayload: formatGeminiPayload,
    parseResponse: parseGeminiResponse,
    getUrl: (baseUrl: string, model: string) => `${baseUrl}/${model}:generateContent`
  },
  [AIModelProvider.OPENAI]: {
    baseUrl: OPENAI_BASE_URL,
    defaultModel: 'gpt-4-turbo',
    apiKeyEnvVar: 'NEXT_PUBLIC_OPENAI_API_KEY',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatPayload: formatOpenAIPayload,
    parseResponse: parseOpenAIResponse,
    getUrl: (baseUrl: string, model: string) => `${baseUrl}/chat/completions`
  },
  [AIModelProvider.GROK]: {
    baseUrl: GROK_BASE_URL,
    defaultModel: 'grok-3',
    apiKeyEnvVar: 'NEXT_PUBLIC_GROK_API_KEY',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatPayload: formatOpenAIPayload,
    parseResponse: parseOpenAIResponse,
    getUrl: (baseUrl: string, model: string) => `${baseUrl}/chat/completions`
  },
  [AIModelProvider.DEEPSEEK]: {
    baseUrl: DEEPSEEK_BASE_URL,
    defaultModel: 'deepseek-coder',
    apiKeyEnvVar: 'NEXT_PUBLIC_DEEPSEEK_API_KEY',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    formatPayload: formatOpenAIPayload,
    parseResponse: parseOpenAIResponse,
    getUrl: (baseUrl: string, model: string) => `${baseUrl}/chat/completions`
  }
};

/**
 * Send a request to the selected AI model API to generate code based on the website design
 * @param designData The JSON data representing the website design
 * @param provider The AI model provider to use (OpenAI, Gemini, Grok, or DeepSeek)
 * @returns The generated code from the AI model
 */
export const generateCodeWithAI = async (
  designData: any, 
  provider: AIModelProvider = AIModelProvider.OPENAI
): Promise<string> => {
  try {
    const config = AI_MODEL_CONFIG[provider];
    
    // Get the API key from environment variables
    console.log(`Using ${provider} API key from environment variable: ${config.apiKeyEnvVar}`);
    const apiKey = process.env[config.apiKeyEnvVar];
    
    if (!apiKey) {
      throw new Error(`${provider} API key is not defined in environment variables (${config.apiKeyEnvVar})`);
    }

    const url = config.getUrl(config.baseUrl, config.defaultModel);
    const payload = config.formatPayload(designData, config.defaultModel);

    // Make the API request
    const response = await axios.post(
      url,
      payload,
      {
        headers: config.headers(apiKey)
      }
    );

    // Return the generated code
    return config.parseResponse(response);
  } catch (error) {
    console.error(`Error calling ${provider} API:`, error);
    throw error;
  }
};