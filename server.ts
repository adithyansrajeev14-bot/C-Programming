import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

// Initialize Gemini client server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Chat endpoint for Celler tutor
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], context } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    if (!ai) {
      res.json({
        reply: "Hello! I'm Celler 🧬. My AI connection is currently awaiting the Gemini API key, but you can explore all our interactive lessons, solved questions, and Code Lab exercises! Let me know if you need help with `void main()`, loops, or operators.",
        source: 'fallback'
      });
      return;
    }

    // Build context-aware prompt
    let contextNote = '';
    if (context) {
      const parts: string[] = [];
      if (context.view) parts.push(`Current page/view: ${context.view}`);
      if (context.challenge) parts.push(`Current lab challenge: ${context.challenge}`);
      if (context.currentCode) parts.push(`User's current code in editor:\n\`\`\`c\n${context.currentCode}\n\`\`\``);
      if (context.consoleOutput) parts.push(`Program output:\n${context.consoleOutput}`);
      if (context.lastError) parts.push(`Last error message:\n${context.lastError}`);
      if (parts.length > 0) {
        contextNote = `\n\n[Active Student Workspace Context]:\n${parts.join('\n')}\n`;
      }
    }

    // Prepare contents array for Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add recent history if provided
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-8)) {
        if (item.role === 'user' || item.role === 'model') {
          contents.push({
            role: item.role,
            parts: [{ text: String(item.text || item.parts?.[0]?.text || '') }]
          });
        }
      }
    }

    // Append the latest user message with context
    contents.push({
      role: 'user',
      parts: [{ text: `${message}${contextNote}` }]
    });

    const systemInstruction = `You are Celler (a cute, cheerful, friendly biological cell mascot 🧬) who acts as an expert C programming tutor for college and high school students.

CRITICAL SYLLABUS REQUIREMENT:
- ALWAYS use 'void main()' in ALL C code snippets, examples, and fixes. NEVER use 'int main()'.
- In 'void main()', do NOT write 'return 0;'. Void functions do not return values.
- Students are being taught and graded under a curriculum (like VTU/Anna Univ/CBSE/Turbo C) where 'void main()' is mandatory.

YOUR TUTORING STYLE & RULES:
1. Warm, encouraging, playful, and pedagogical. You love cells, biology analogies, and making computer science simple.
2. When explaining C concepts (variables, pointers, loops, conditions, memory, operators):
   - Keep answers concise, clear, and easy to read.
   - Use bolding for key terms and backticks for keywords like \`scanf\`, \`printf\`, \`%d\`, \`void main()\`.
   - When providing code, use formatted markdown code blocks with \`\`\`c and \`void main()\`.
3. When debugging student code:
   - Identify the exact line and issue (e.g., forgetting '&' in \`scanf("%d", &x)\`, using '=' instead of '==' in conditions, missing semicolon ';', integer division like 5/9 = 0, forgetting to increment in a while loop).
   - Show how to fix it with encouraging words!
4. Answer student questions about algorithms, flowcharts, dry runs, exam tips, and problem solving.
5. If the user asks general questions about C, programming, or exam preparation, give structured, helpful advice.`;

    let geminiResponse: any = null;
    let attempts = 0;
    while (attempts < 2) {
      try {
        geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        break;
      } catch (err: any) {
        attempts++;
        if (attempts < 2 && (err?.message?.includes('503') || err?.status === 503 || err?.message?.includes('high demand'))) {
          await new Promise((r) => setTimeout(r, 800));
        } else {
          throw err;
        }
      }
    }

    const reply = geminiResponse?.text || "I'm here to help with your C code! Ask me anything about `void main()`, loops, or debugging.";
    res.json({ reply, source: 'ai' });
  } catch (error: any) {
    console.error('Error generating response from Gemini:', error);
    
    // Check if error is transient high demand
    const isBusy = error?.message?.includes('503') || error?.message?.includes('high demand') || error?.status === 503;
    const busyMsg = "The AI service is experiencing a brief traffic spike right now. In the meantime, remember: in our syllabus every program begins with `void main()` without `return 0;`. You can ask me again in a moment or explore the Code Lab!";
    
    res.json({
      reply: isBusy ? busyMsg : "Hello! I had a momentary connection hiccup. Remember: all our syllabus programs begin with `void main()`. Please try asking again in a few seconds!",
      source: 'error_fallback'
    });
  }
});

// Setup Vite middleware in dev or static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
