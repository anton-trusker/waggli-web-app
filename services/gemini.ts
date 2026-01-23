import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper to sanitize JSON
const cleanJSON = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const generateHealthCheck = async (pet: any, records: any[], score: number, activities: any[] = []) => {
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
      Create a personalized care guide for these pets, considering their health context.
      Pets: ${JSON.stringify(pets.map(p => ({
            name: p.name,
            breed: p.breed,
            age: p.age,
            allergies: p.allergies
        })))}
      Context: ${JSON.stringify(context)}
      (Context includes: Health Score, Upcoming Appointments, Known Allergies)

      Return a JSON array of 3-5 tips.
      Rules:
      1. If allergies exist, mention specific avoidance tips (e.g. "Avoid Chicken treats").
      2. If appointments are upcoming (next 3 days), add a prep tip (e.g. "Fast before surgery" if applicable).
      3. If health score is low, suggest the missing action (e.g. "Book vaccination").
      
      Output format: Array of { title: string, content: string }
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJSON(text));
    } catch (error) {
        console.error("Gemini Care Guide Error:", error);
        return [{ title: "General Advice", content: "Ensure fresh water is always available." }];
    }
};

export const generatePetNews = async () => {
    try {
        const prompt = `
      Generate 3 fictitious or general scientific news items about pet health/research.
      Return JSON array with:
      - headline: string
      - snippet: string
      - source: string
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(cleanJSON(text));
    } catch (error) {
        return [
            { headline: "New Study on Dog Cognition", snippet: "Research shows dogs understand more words than previously thought.", source: "Vet Science Daily" },
            { headline: "Cat Nutrition Breakthrough", snippet: "Optimal protein ratios for senior cats identified.", source: "Pet Health Journal" }
        ];
    }
};

export const analyzeDocument = async (base64Image: string, mimeType: string) => {
    try {
        const prompt = `
      Extract data from this medical document/invoice.
      Return JSON:
      - type: "vaccination" | "medication" | "invoice" | "lab" | "other"
      - title: string (e.g. "Rabies Vaccine" or "Vet Invoice")
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

export const analyzeSymptoms = async (symptoms: string, petDetails: any) => {
    try {
        const prompt = `
      Analyze these symptoms for a pet:
      Pet: ${JSON.stringify(petDetails)}
      Symptoms: ${symptoms}
      
      Return JSON:
      - severity: "Low" | "Medium" | "High" | "Emergency"
      - possible_causes: string[]
      - recommendation: string
      - disclaimer: "This is AI advice, not a vet diagnosis."
    `;
        const result = await model.generateContent(prompt);
        return JSON.parse(cleanJSON(result.response.text()));
    } catch (error) {
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
    // Placeholder as text-to-image is not available in gemini-flash standard endpoint usually, 
    // or requires specific call. Returning placeholder.
    return `https://via.placeholder.com/300?text=${encodeURIComponent(description.slice(0, 20))}`;
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
