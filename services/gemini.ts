import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
// Use flash model by default, but handle fallback in calls
// Use pro model for better insights
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Helper to sanitize JSON
const cleanJSON = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const generateHealthCheck = async (pet: any, records: any[] = [], score: number = 85, activities: any[] = []) => {
    try {
        const prompt = `
      Analyze this pet's health status based on their profile, deterministic wellness score, and records.
      Pet: ${JSON.stringify(pet)}
      Wellness Score (0-100, Algo-calculated): ${score}
      Medical Records: ${JSON.stringify(records)}
      Recent Activities (including allergies/logs): ${JSON.stringify(activities.slice(0, 10))}
      
      Return a JSON object with:
      - score: number (Use the provided score as baseline, but adjust slightly if AI finds qualitative insights, stay within +/- 5 points)
      - summary: string (Explain the score: e.g. "Score is 60 because vaccines are overdue and weight checks are missing.")
      - status: "Excellent" | "Good" | "Fair" | "Needs Attention" (derive from score: >90 Exc, >75 Good, >60 Fair, else Needs Attn)
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJSON(text));
    } catch (error) {
        console.error("Gemini Health Check Error:", error);
        return { score: score || 85, summary: "Analysis unavailable.", status: "Good" };
    }
};

export const generateCareGuide = async (pets: any[], context: any = {}) => {
    if (!pets.length) return [];

    try {
        const prompt = `
      Create a personalized daily care guide for a multi-pet owner.
      Pets: ${JSON.stringify(pets.map(p => ({
            name: p.name,
            breed: p.breed,
            age: p.age,
            allergies: p.allergies
        })))}
      Health Context: ${JSON.stringify(context.overview || context)}
      Upcoming Appointments: ${JSON.stringify(context.appointments || [])}
      
      Requirements:
      - Provide 3-5 actionable tips.
      - Ensure tips cover different pets if applicable.
      - Format as JSON array: [{ "title": "Tip Title", "content": "Instructional content" }]
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJSON(text));
    } catch (error) {
        console.error("Care Guide Error", error);
        return [
            { title: "Hydration Check", content: "Ensure all water bowls are clean and filled with fresh water." },
            { title: "Regular Brush", content: "Spend 5 minutes brushing your pet to reduce shedding and build bond." }
        ];
    }
};

export const generatePetNews = async (pets: any[] = []) => {
    try {
        let prompt = `
      Generate 3-5 highly relevant scientific or wellness news items for a pet owner with multiple pets.
      Pets: ${JSON.stringify(pets.map(p => ({ name: p.name, breed: p.breed, age: p.age, allergies: p.allergies })))}
      
      Requirements:
      - Include at least one item specific to each pet if possible.
      - Return JSON array with:
        - headline: string
        - snippet: string (mention which pet this relates to if specific)
        - source: string
        - url: string (fictitious link for demo)
    `;

        if (pets.length === 0) {
            prompt = `Generate 3 general pet wellness news items. Return JSON array with headline, snippet, source, url.`;
        }

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJSON(text));
    } catch (error) {
        console.error("News Generation Error", error);
        return [
            { headline: "New Study on Dog Cognition", snippet: "Research shows dogs understand more words than previously thought.", source: "Vet Science Daily", url: "#" },
            { headline: "Cat Nutrition Breakthrough", snippet: "Optimal protein ratios for senior cats identified.", source: "Pet Health Journal", url: "#" }
        ];
    }
};

export const analyzeDocument = async (base64Image: string, mimeType: string) => {
    try {
        const prompt = `
      Extract data from this medical document / invoice.
      Return JSON:
        - type: "vaccination" | "medication" | "invoice" | "lab" | "other"
        - title: string
        - date: string (YYYY-MM-DD)
        - doctor: string (optional)
        - cost: string (optional)
        - summary: string (short description)
    `;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        return JSON.parse(cleanJSON(result.response.text()));
    } catch (error) {
        console.error("Document Analysis Error:", error);
        return null;
    }
};

export const parseNaturalLanguageRecord = async (text: string) => {
    try {
        const prompt = `
      Parse this text into a medical record: "${text}"
      Return JSON:
        - type: "vaccination" | "medication" | "vitals" | "checkup"
        - title: string
        - date: string (YYYY-MM-DD, default to today if not specified)
        - additional_data: object (key-value pairs extracted)
    `;

        const result = await model.generateContent(prompt);
        return JSON.parse(cleanJSON(result.response.text()));
    } catch (error) {
        console.error("NLP Parse Error:", error);
        return null;
    }
};

export const analyzeSymptoms = async (symptoms: string, imageData?: string, imageType?: string) => {
    try {
        const prompt = `
      Analyze these symptoms for a pet:
      Symptoms: ${symptoms}
      
      Return JSON:
        - severity: "Low" | "Medium" | "High" | "Emergency"
        - possible_causes: string[]
        - recommendation: string
        - disclaimer: "This is AI advice, not a vet diagnosis."
    `;

        const parts: any[] = [prompt];
        if (imageData && imageType) {
            parts.push({
                inlineData: {
                    data: imageData,
                    mimeType: imageType
                }
            });
        }

        const result = await model.generateContent(parts);
        return JSON.parse(cleanJSON(result.response.text()));
    } catch (error) {
        console.error("Symptom analysis error", error);
        return {
            severity: "Unknown",
            recommendation: "Please consult a vet.",
            possible_causes: ["Consultation needed"],
            disclaimer: "System unreachable."
        };
    }
};

export const analyzeVaccineSchedule = async (vaccines: any[], petDetails: any) => {
    try {
        const prompt = `
            Review this vaccine history for a ${petDetails.species} (${petDetails.breed}, ${petDetails.age} years old).
            History: ${JSON.stringify(vaccines)}
            
            Return JSON:
            - status: "Up to Date" | "Overdue" | "Incomplete"
            - missing: string[] (names of core vaccines missing)
            - next_due: string (approximate date or "ASAP")
            - recommendations: string
        `;
        const result = await model.generateContent(prompt);
        return JSON.parse(cleanJSON(result.response.text()));
    } catch (e) {
        return { status: "Unknown", missing: [], recommendations: "Check with vet." };
    }
};

export const generatePetAvatar = async (description: string) => {
    return `https://placehold.co/300x300?text=${encodeURIComponent(description.slice(0, 20))}`;
};

export const generateBulkTranslations = async (texts: Record<string, string>, targetLang: string) => {
    try {
        const prompt = `
            Translate these UI strings to ${targetLang}. Return JSON with same keys.
            Strings: ${JSON.stringify(texts)}
        `;
        const result = await model.generateContent(prompt);
        return JSON.parse(cleanJSON(result.response.text()));
    } catch (e) {
        console.error("Translation failed", e);
        return texts; // Fallback to original
    }
};
