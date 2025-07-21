import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
	const { name, tone, background_info } = await req.json();

	if (!name || !tone || !background_info) {
		return NextResponse.json(
			{ error: "Missing required fields: name, tone, background_info" },
			{ status: 400 }
		);
	}

	const prompt = `
Given the following AI influencer profile:
- Name: ${name}
- Tone: ${tone}
- Background/Mission: ${background_info}

Generate a detailed target audience and a set of primary goals for this influencer.
Return the data in a valid JSON object with the following structure. Do not include any text other than the JSON object.

{
  "goals": ["string", "string", "string"],
  "audience_age_range": [number, number],
  "audience_gender": "all" | "male" | "female" | "other",
  "audience_interests": ["string", "string", "string"],
  "audience_region": "North America" | "Europe" | "Asia" | "South America" | "Africa" | "Australia" | "Other"
}
`;

	try {
		const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

		const result = await model.generateContent(prompt);
		const text = result.response.text();

		// Extract the JSON response
		const firstBraceIndex = text.indexOf("{");
		const lastBraceIndex = text.lastIndexOf("}");
		const jsonStr = text.substring(firstBraceIndex, lastBraceIndex + 1);
		const suggestions = JSON.parse(jsonStr);

		return NextResponse.json(suggestions);
	} catch (error) {
		console.error("Gemini API call failed:", error);
		return NextResponse.json(
			{ error: "Failed to generate suggestions from Gemini AI." },
			{ status: 500 }
		);
	}
}
