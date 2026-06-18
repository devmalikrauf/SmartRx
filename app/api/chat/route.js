import { NextResponse } from 'next/server';

// Suggested quick questions to display above the chat input
const SUGGESTED_QUESTIONS = [
  "Ye medicine kis cheez ke liye hai?",
  "Is medicine ke side effects kya hain?",
  "Test kyun bataya gaya?",
  "Medicine khane ka sahi waqt kya hai?",
  "Koi parhezi hai?"
];

// POST /api/chat
export async function POST(req) {
  try {
    // Parse the incoming request to get the user's message and prescription context
    const body = await req.json().catch(() => ({}));
    const { message, prescriptionData } = body;

    // VERY STRICT SYSTEM PROMPT
    const systemPrompt = `
You are the SmartRx medical assistant.

Context (Full Prescription Data):
${JSON.stringify(prescriptionData, null, 2) || "No prescription data provided."}

CRITICAL RULES YOU MUST FOLLOW:
1. You are the SmartRx medical assistant, not a doctor.
   // Reason: Tells AI its identity and boundaries clearly.
   
2. ONLY discuss what is explicitly written in the provided prescription context.
   // Reason: Strictly limits AI to ONLY discuss what is in the prescription to avoid giving unrelated advice.

3. If the user asks about a medicine, symptom, or topic NOT in the prescription context, you MUST reply exactly with: "Ye information aapki prescription mein nahi hai".
   // Reason: Prevents hallucination and ensures AI doesn't guess medical information.

4. NEVER suggest changing, stopping, or starting any dosage or medication.
   // Reason: Changing dosage is strictly a real doctor's job; AI doing this is dangerous.

5. NEVER diagnose any disease or medical condition.
   // Reason: AI is not legally or ethically allowed to diagnose patients.

6. If the user expresses a serious concern, pain, or emergency, you MUST say: "Apne doctor se rabta karein".
   // Reason: Life-threatening or serious issues must be handled by a real doctor immediately.

7. ALWAYS respond in simple Roman Urdu that a normal, non-medical person can easily understand.
   // Reason: Ensures the chatbot is accessible and easy to talk to for the local target audience.

8. Do NOT use complex medical terms. If you have to use one, explain it immediately in simple words.
   // Reason: Medical jargon confuses patients; the goal is to clarify the prescription, not confuse them further.
`;

    // TODO: Connect to LLM (e.g., Gemini or OpenAI) here using the systemPrompt and user message.
    
    // Returning the structured skeleton including our new prompt and suggested questions
    return NextResponse.json({ 
      success: true, 
      message: 'AI chatbot prescription discussion endpoint ready.',
      suggestedQuestions: SUGGESTED_QUESTIONS,
      debugPrompt: systemPrompt
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
