export type QuizQuestion = {
    id: number;
    phase: 1 | 2;
    type: 'image' | 'text';
    text: string;
    leftOption: { text: string; archetype?: string; image?: string };
    rightOption: { text: string; archetype?: string; image?: string };
};

export const QUIZ_DATA: QuizQuestion[] = [
    // PHASE 1: VIBE CHECK (Visual, High Energy)
    {
        id: 1,
        phase: 1,
        type: 'image',
        text: "What's the volume of your evening?",
        leftOption: { text: "Low / Curated", archetype: "THE_ARCHITECT", image: "https://placehold.co/400x600/111/FFF?text=Low+Vol" },
        rightOption: { text: "High / Neon", archetype: "THE_HUSTLER", image: "https://placehold.co/400x600/111/FFF?text=High+Vol" },
    },
    {
        id: 2,
        phase: 1,
        type: 'image',
        text: "Choose your light.",
        leftOption: { text: "Warm Candle", archetype: "THE_MYSTIC", image: "https://placehold.co/400x600/111/FFF?text=Candle" },
        rightOption: { text: "Neon Pulse", archetype: "THE_NOMAD", image: "https://placehold.co/400x600/111/FFF?text=Neon" },
    },
    {
        id: 3,
        phase: 1,
        type: 'image',
        text: "In a group of four, you usually...",
        leftOption: { text: "Lead", archetype: "THE_SOCIALITE", image: "https://placehold.co/400x600/111/FFF?text=Lead" },
        rightOption: { text: "Listen", archetype: "THE_POET", image: "https://placehold.co/400x600/111/FFF?text=Listen" },
    },
    {
        id: 4,
        phase: 1,
        type: 'image',
        text: "Your ideal table setting.",
        leftOption: { text: "Minimalist", archetype: "THE_ARCHITECT", image: "https://placehold.co/400x600/111/FFF?text=Minimal" },
        rightOption: { text: "Eclectic", archetype: "THE_NOMAD", image: "https://placehold.co/400x600/111/FFF?text=Eclectic" },
    },

    // PHASE 2: DEPTH LOCK (Text-based, High Status)
    {
        id: 5,
        phase: 2,
        type: 'text',
        text: "Best thing about meeting someone new?",
        leftOption: { text: "Fresh Perspective", archetype: "THE_SOCIALITE" },
        rightOption: { text: "Shared Hobby", archetype: "THE_POET" },
    },
    {
        id: 6,
        phase: 2,
        type: 'text',
        text: "Success tonight means talking about...",
        leftOption: { text: "Big Ideas", archetype: "THE_HUSTLER" },
        rightOption: { text: "Hidden Gems", archetype: "THE_MYSTIC" },
    },
    {
        id: 7,
        phase: 2,
        type: 'text',
        text: "Are you ready to be present?",
        leftOption: { text: "I'm in", archetype: "THE_ARCHITECT" }, // Reusing archetypes for logic, but this is a commitment Q
        rightOption: { text: "I'll try", archetype: "THE_NOMAD" },
    },
];
