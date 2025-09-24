export interface AISummary {
  summary: string;
  possibleCauses: string[];
  recommendedSpecialist: string;
  questionsForDoctor: string[];
}

export type MessageContent =
  | { type: "text"; text: string }
  | { type: "summary"; data: AISummary };

export interface Message {
  id: string;
  sender: "user" | "ai";
  content: MessageContent;
}

export interface ApiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type AIResponse =
  | { type: "text"; content: string }
  | { type: "summary"; content: AISummary };
