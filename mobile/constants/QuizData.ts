
export type Archetype = 'THE_BRUTALIST' | 'THE_EPICUREAN' | 'THE_CATALYST' | 'THE_OBSERVER' | 'THE_MODERNIST';

export type QuizOption = {
    text: string;
    weights: Partial<Record<Archetype, number>>;
};

export type QuizQuestion = {
    id: number;
    phase: 1 | 2;
    text: string; // The Question
    image: string; // Background Image
    options: QuizOption[];
};

export const QUIZ_DATA: QuizQuestion[] = [
    // PHASE 1: VIBE CHECK
    {
        id: 1,
        phase: 1,
        text: "What's the volume of your evening?",
        image: "https://placehold.co/600x900/111/FFF?text=Noise", // Placeholder for grainy B/W
        options: [
            { text: "Ambient", weights: { THE_OBSERVER: 2 } },
            { text: "Electric", weights: { THE_EPICUREAN: 2 } },
            { text: "Curated", weights: { THE_CATALYST: 2 } },
        ]
    },
    {
        id: 2,
        phase: 1,
        text: "Choose your light.",
        image: "https://placehold.co/600x900/111/FFF?text=Light",
        options: [
            { text: "Warm Candle", weights: { THE_EPICUREAN: 1, THE_OBSERVER: 1 } },
            { text: "Neon Pulse", weights: { THE_BRUTALIST: 2 } },
            { text: "Natural Twilight", weights: { THE_MODERNIST: 2 } },
        ]
    },
    {
        id: 3,
        phase: 1,
        text: "At the table, you are...",
        image: "https://placehold.co/600x900/111/FFF?text=Table",
        options: [
            { text: "The Anchor", weights: { THE_MODERNIST: 3 } },
            { text: "The Spark", weights: { THE_CATALYST: 3 } },
            { text: "The Observer", weights: { THE_OBSERVER: 3 } },
        ]
    },
    {
        id: 4,
        phase: 1,
        text: "Select your surroundings.",
        image: "https://placehold.co/600x900/111/FFF?text=Space",
        options: [
            { text: "Raw & Industrial", weights: { THE_BRUTALIST: 3 } },
            { text: "Soft & Heritage", weights: { THE_EPICUREAN: 2 } },
            { text: "Sharp & Glass", weights: { THE_MODERNIST: 3 } },
        ]
    },
    // PHASE 2: DEPTH LOCK
    {
        id: 5,
        phase: 2,
        text: "The best part of a new encounter is...",
        image: "https://placehold.co/600x900/111/FFF?text=Connection",
        options: [
            { text: "A fresh perspective", weights: { THE_OBSERVER: 1, THE_CATALYST: 1 } },
            { text: "Shared obsession", weights: { THE_BRUTALIST: 1 } },
            { text: "Unexpected energy", weights: { THE_EPICUREAN: 1 } },
        ]
    },
    {
        id: 6,
        phase: 2,
        text: "Tonight is a success if we talk about...",
        image: "https://placehold.co/600x900/111/FFF?text=Intent",
        options: [
            { text: "Ideas", weights: { THE_BRUTALIST: 2, THE_CATALYST: 2 } },
            { text: "Exploration", weights: { THE_EPICUREAN: 1 } },
            { text: "Escapism", weights: { THE_MODERNIST: 1 } },
        ]
    },
    {
        id: 7,
        phase: 2,
        text: "KRETS is a phone-free ritual. Are you in?",
        image: "https://placehold.co/600x900/111/FFF?text=Pact",
        options: [
            { text: "Yes, I am present.", weights: {} }, // Threshold check, no specific points or maybe points to all? Logic says "Binary" check.
        ]
    }
];
