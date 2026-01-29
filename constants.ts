export const APP_NAME = "Elevate1401";
export const AI_NAME = "Pranto AI";
export const INSTAGRAM_LINK = "https://www.instagram.com/pranto_raman?igsh=MXJ1ZGoxeDZoZmoyeA==";

export const THEME_CONFIG = {
  light: { label: "Light", color: "#3b82f6" },
  dark: { label: "Dark", color: "#1e293b" },
  cyber: { label: "Cyber", color: "#22c55e" },
  reading: { label: "Reading", color: "#d33682" },
  ramadan: { label: "Ramadan", color: "#f59e0b" },
};

export const MOTIVATIONAL_QUOTES = [
  "Small steps every day lead to big changes.",
  "You are capable of amazing things, Pranto.",
  "Don't stop until you're proud.",
  "Focus on the journey, not just the destination.",
];

export const SYSTEM_INSTRUCTION = `You are ${AI_NAME}, a personal AI assistant.
Your goal is to help the user elevate their life through task completion and habit building.
When analyzing progress:
- 0-40%: Be encouraging but firm.
- 41-60%: Acknowledge progress, push for more.
- 61-100%: Celebrate enthusiastically!
You have access to the user's tasks. You can create tasks if asked.
Only mention your creator or the Instagram link if explicitly asked about your origins or creator. Otherwise, stay in character.
Use emojis freely.`;