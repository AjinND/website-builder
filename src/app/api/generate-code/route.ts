import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com', // DeepSeek API endpoint from the example
    apiKey: process.env.DEEPSEEK_API_KEY, // Loaded from environment variables
});

export async function POST(req: Request) {
    try {
        const body = await req.json(); // Proper way to parse body in App Router
        console.log('Request body:', body);

        const { jsonData } = body;

        if (!jsonData) {
            return new Response(JSON.stringify({ error: 'Missing jsonData in request body' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that generates React code from JSON design data.',
                },
                {
                    role: 'user',
                    content: `Generate a React functional component for a page based on this design: ${JSON.stringify(jsonData)}. 
                    Analyze the JSON data and visualize how it would be and then create the components that are required for a 
                    React application. Don't try to hardcode the position of the elements unless it's necessary. The code generated 
                    for the design should be responsive and adhere to the latest coding practices. Use Tailwind CSS for now and 
                    make use of containers to align with the design provided.`
                },
            ],
            model: 'deepseek-chat',
        });

        const generatedCode = completion.choices[0].message.content;

        return new Response(JSON.stringify({ generatedCode }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error generating code:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate code' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
