import { ai, MODEL } from "./geminiClient";
import { SYSTEM_PROMPT } from "./systemPrompt";
import { TOOLS_DECLARATIONS } from "./toolDefinitions";
import { executeTool } from "./toolExecutor";
import { useBuilderStore } from "../store/builderStore";

export async function sendMessageToAI(userMessageText) {
  const store = useBuilderStore.getState();
  
  // Create stateless context
  const context = {
    widgets: store.widgets.map(w => ({ id: w.id, type: w.type, title: w.title })),
    filters: store.filters,
  };

  const fullPrompt = `Kullanıcının mevcut kanvas durumu:
${JSON.stringify(context, null, 2)}

Kullanıcı mesajı: "${userMessageText}"`;

  try {
    const chat = ai.chats.create({
      model: MODEL,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
        tools: [{ functionDeclarations: TOOLS_DECLARATIONS }],
      },
    });

    let response = await chat.sendMessage({ text: fullPrompt });

    // Handle tool calls in a loop (max 3 times to prevent infinite loops)
    let loopCount = 0;
    while (response.functionCalls?.length > 0 && loopCount < 3) {
      loopCount++;
      const results = [];
      
      for (const call of response.functionCalls) {
        console.log(`[AI Co-Pilot] Executing: ${call.name}`, call.args);
        const result = await executeTool(call.name, call.args);
        results.push({
          functionResponse: {
            name: call.name,
            response: result
          }
        });
      }
      
      response = await chat.sendMessage({ message: results });
    }

    if (response.text) {
      store.appendAIMessage({ role: "ai", text: response.text });
    } else {
      store.appendAIMessage({ role: "ai", text: "İşlem tamamlandı." });
    }
  } catch (error) {
    console.error("AI Error:", error);
    store.appendAIMessage({ role: "ai", text: `Bir hata oluştu: ${error.message}` });
  }
}
