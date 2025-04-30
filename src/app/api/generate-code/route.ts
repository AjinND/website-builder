import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AIModelProvider, ServerAIModelConfig } from '@/types/types';
import { GoogleGenAI } from '@google/genai';

// Define the comprehensive prompt for generating Next.js code from design JSON
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

// Server-side AI model configuration
const AI_MODEL_CONFIG: Record<AIModelProvider, ServerAIModelConfig> = {
    [AIModelProvider.GEMINI]: {
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
        defaultModel: 'gemini-2.5-pro-exp-03-25',
        apiKeyEnvVar: 'GEMINI_API_KEY',
    },
    [AIModelProvider.OPENAI]: {
        baseURL: 'https://api.openai.com/v1',
        defaultModel: 'gpt-4-turbo',
        apiKeyEnvVar: 'OPENAI_API_KEY',
    },
    [AIModelProvider.GROK]: {
        baseURL: 'https://api.grok.ai/v1', // Placeholder; replace with actual Grok API endpoint
        defaultModel: 'grok-1',
        apiKeyEnvVar: 'GROK_API_KEY',
    },
    [AIModelProvider.DEEPSEEK]: {
        baseURL: 'https://api.deepseek.com/v1', // Placeholder; replace with actual DeepSeek API endpoint
        defaultModel: 'deepseek-coder',
        apiKeyEnvVar: 'DEEPSEEK_API_KEY',
    },
};

export async function POST(req: Request) {
    try {
        // Parse the request body
        const body = await req.json();
        console.log('Request body:', body);

        const { designData, provider = AIModelProvider.GEMINI } = body;

        // Validate the request body
        if (!designData) {
            return NextResponse.json({ error: 'Missing jsonData in request body' }, { status: 400 });
        }

        // Get the configuration for the selected provider
        const config = AI_MODEL_CONFIG[provider as AIModelProvider];
        if (!config) {
            return NextResponse.json({ error: 'Invalid AI provider specified' }, { status: 400 });
        }

        // Retrieve the API key from environment variables
        const apiKey = process.env[config.apiKeyEnvVar];
        if (!apiKey) {
            return NextResponse.json(
                { error: `API key for ${provider} is not configured` },
                { status: 500 }
            );
        }

        // Format the JSON data as a string
        const jsonDesignData = JSON.stringify(designData, null, 2);

        // Create the messages array for the AI request
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            {
                role: 'system',
                content: NEXTJS_GENERATION_PROMPT,
            },
            {
                role: 'user',
                content: `JSON Data of the Design:\n\`\`\`json\n${jsonDesignData}\n\`\`\``,
            },
        ];

        // Variable to store the generated code
        let generatedCode: string = '';

        // Provider-specific API calls
        if (provider === AIModelProvider.OPENAI) {
            const openai = new OpenAI({
                baseURL: config.baseURL,
                apiKey: apiKey,
            });

            const completion = await openai.chat.completions.create({
                messages,
                model: config.defaultModel,
                temperature: 0.7,
                max_tokens: 8000,
            });

            generatedCode = completion.choices[0].message.content ?? '';
        } else if (provider === AIModelProvider.GROK) {
            // Placeholder for Grok API call (adjust based on actual Grok API documentation)
            const response = await fetch(`${config.baseURL}/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: config.defaultModel,
                    messages,
                    temperature: 0.7,
                    max_tokens: 8000,
                }),
            });

            if (!response.ok) {
                throw new Error(`Grok API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            generatedCode = data.choices[0].message.content;
        } else if (provider === AIModelProvider.DEEPSEEK) {
            // Placeholder for DeepSeek API call (adjust based on actual DeepSeek API documentation)
            const response = await fetch(`${config.baseURL}/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: config.defaultModel,
                    messages,
                    temperature: 0.7,
                    max_tokens: 8000,
                }),
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            generatedCode = data.choices[0].message.content;
        } else if (provider === AIModelProvider.GEMINI) {
            const ai = new GoogleGenAI({
                apiKey: apiKey,
            });
            const config = {
                responseMimeType: 'text/plain',
            };
            const model = 'gemini-2.5-pro-exp-03-25';
            const contents = [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `${NEXTJS_GENERATION_PROMPT}\n\nJSON Data of the Design:\n\`\`\`json\n${jsonDesignData}\n\`\`\``,
                        },
                    ],
                },
            ];

            const contentStream = await ai.models.generateContentStream({
                model,
                config,
                contents,
            });

            generatedCode = '';
            for await (const chunk of contentStream) {
                generatedCode += chunk.text;
            }
            // for await (const chunk of generatedCode) {
            //     console.log(chunk.text);
            // }
        } else {
            return NextResponse.json({ error: 'Unsupported AI provider' }, { status: 400 });
        }

        // Return the generated code in a standardized response
        return NextResponse.json({success: true, generatedCode: generatedCode });
    } catch (error) {
        // Log and handle errors
        console.error('Error generating code:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            { error: 'Failed to generate code', details: errorMessage },
            { status: 500 }
        );
    }
}