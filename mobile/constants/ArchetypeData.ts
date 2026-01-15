import { Archetype } from './QuizData';

export type ArchetypeDetails = {
    name: string;
    tagline: string;
    description: string;
    tableRole: string;
    pairsWith: string[];
    image: string;
};

export const ARCHTYPE_DATA: Record<Archetype, ArchetypeDetails> = {
    THE_BRUTALIST: {
        name: "THE BRUTALIST",
        tagline: "Raw Form. Pure Intent.",
        description: "You find beauty in the unvarnished and the structural. Whether it’s a codebase, a building, or a conversation, you value the \"how\" as much as the \"what.\" You have a low tolerance for fluff and a high appreciation for honesty.",
        tableRole: "You are the grounding force. You cut through small talk to find the core of an idea.",
        pairsWith: ["The Modernist", "The Observer"],
        image: "https://placehold.co/600x600/111/FFF?text=Brutalist",
    },
    THE_EPICUREAN: {
        name: "THE EPICUREAN",
        tagline: "The Art of the Senses.",
        description: "For you, the world is a sensory narrative. You notice the vintage of the wine, the curve of the furniture, and the subtle shifts in the room's energy. You believe that life is too short for mediocre experiences.",
        tableRole: "You are the warmth. You transform a meal into a ritual.",
        pairsWith: ["The Catalyst", "The Modernist"],
        image: "https://placehold.co/600x600/111/FFF?text=Epicurean",
    },
    THE_CATALYST: {
        name: "THE CATALYST",
        tagline: "The Spark of the 'Why'.",
        description: "You are a builder of ideas and a disruptor of patterns. Your mind moves at the speed of a startup pivot, constantly connecting disparate dots. You aren't interested in what is; you are obsessed with what could be.",
        tableRole: "You are the energy. You ask the question that makes the room go silent for a second.",
        pairsWith: ["The Epicurean", "The Observer"],
        image: "https://placehold.co/600x600/111/FFF?text=Catalyst",
    },
    THE_OBSERVER: {
        name: "THE OBSERVER",
        tagline: "The Quiet Architect.",
        description: "You see the patterns that everyone else misses. You value silence as a tool and speech as a precision instrument. You have a deep, specialized knowledge of your obsessions and a dry wit that rewards those who listen closely.",
        tableRole: "You are the depth. When you speak, it carries weight.",
        pairsWith: ["The Brutalist", "The Catalyst"],
        image: "https://placehold.co/600x600/111/FFF?text=Observer",
    },
    THE_MODERNIST: {
        name: "THE MODERNIST",
        tagline: "Curated Precision.",
        description: "You live in the future, but you’re rooted in clarity. From your toolkit to your social circle, everything is selected with intention. You value efficiency, sleek aesthetics, and the high-functioning logic of a well-ordered mind.",
        tableRole: "You are the anchor. You maintain the momentum of the evening.",
        pairsWith: ["The Brutalist", "The Epicurean"],
        image: "https://placehold.co/600x600/111/FFF?text=Modernist",
    },
};
