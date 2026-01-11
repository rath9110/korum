export type QuizQuestion = {
    id: number;
    text: string;
    leftOption: { text: string; archetype: string; image: string };
    rightOption: { text: string; archetype: string; image: string };
};

export const QUIZ_DATA: QuizQuestion[] = [
    {
        id: 1,
        text: "Friday Night",
        leftOption: { text: "Gallery Opening", archetype: "THE_ARCHITECT", image: "https://placehold.co/400x600/111/FFF?text=Gallery" },
        rightOption: { text: "Underground Rave", archetype: "THE_NOMAD", image: "https://placehold.co/400x600/111/FFF?text=Rave" },
    },
    {
        id: 2,
        text: "Your Vibe",
        leftOption: { text: "Minimalist Luxe", archetype: "THE_SOCIALITE", image: "https://placehold.co/400x600/111/FFF?text=Luxe" },
        rightOption: { text: "Vintage Chao", archetype: "THE_POET", image: "https://placehold.co/400x600/111/FFF?text=Vintage" },
    },
    {
        id: 3,
        text: "Drink of Choice",
        leftOption: { text: "Natural Wine", archetype: "THE_MYSTIC", image: "https://placehold.co/400x600/111/FFF?text=Wine" },
        rightOption: { text: "Spicy Marg", archetype: "THE_HUSTLER", image: "https://placehold.co/400x600/111/FFF?text=Marg" },
    },
    {
        id: 4,
        text: "Ideal Date",
        leftOption: { text: "Rooftop Talk", archetype: "THE_SOCIALITE", image: "https://placehold.co/400x600/111/FFF?text=Rooftop" },
        rightOption: { text: "Dive Bar Deep Dive", archetype: "THE_POET", image: "https://placehold.co/400x600/111/FFF?text=Dive" },
    },
    {
        id: 5,
        text: "Sunday Morning",
        leftOption: { text: "Spin Class", archetype: "THE_HUSTLER", image: "https://placehold.co/400x600/111/FFF?text=Spin" },
        rightOption: { text: "Forest Walk", archetype: "THE_MYSTIC", image: "https://placehold.co/400x600/111/FFF?text=Forest" },
    },
];
