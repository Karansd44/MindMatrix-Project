/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function askKumbaraAI(question: string, language: string = 'en') {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are Kumbara-Kala AI, a helpful assistant for rural pottery artisans.
        Your goal is to promote traditional clay pottery by explaining its health benefits and providing accurate craft advice.
        
        Respond in ${language}.
        
        Context:
        - Clay is naturally alkaline and porous, which cools water naturally.
        - Cooking in clay retains nutrients and adds minerals like calcium, magnesium, and phosphorus.
        - Clay pots are 100% eco-friendly and replace plastic/aluminum.
        
        User Question: ${question}
      `
    });

    return response.text || "I'm not sure how to answer that.";
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
}
