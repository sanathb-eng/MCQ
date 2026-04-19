import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { chunkData, config } = await request.json();

    if (!chunkData || !config) {
      return NextResponse.json({ error: 'Missing chunkData or config.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API Key is not configured on the server.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert Corporate Law II professor creating an exam for law students.
Using ONLY the following topic material, generate ${config.count} multiple-choice questions at a ${config.difficulty} difficulty level.

CRITICAL INSTRUCTIONS:
- The questions MUST be entirely based on the provided material. Do not introduce outside concepts.
- Provide exactly 4 options labeled "A", "B", "C", and "D".
- Only one option should be unambiguously correct.
- Provide a detailed explanation for why the correct answer is right and why the distractors are wrong, citing the specific case or principle from the material.
- Output MUST be valid JSON matching this exact schema, without any markdown formatting wrappers (no \`\`\`json):
{
  "questions": [
    {
      "text": "Question text here",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Detailed explanation mentioning the specific rule or case."
    }
  ]
}

MATERIAL START ---
Topic: ${chunkData.title}
Key Principles: ${(chunkData.key_principles || []).join(' | ')}
Cases Discussed: ${(chunkData.cases || []).join(' | ')}

Full Content:
${chunkData.content}
--- MATERIAL END
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    const parsed = JSON.parse(text);
    if (!parsed.questions || parsed.questions.length === 0) {
      throw new Error('No questions generated.');
    }

    return NextResponse.json({ questions: parsed.questions });
  } catch (error) {
    console.error('Error generating MCQs:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions: ' + error.message },
      { status: 500 }
    );
  }
}
