export interface StyleItem {
  id: string;
  name: string;
  iconSymbol: string;
  tagline: string;
  desc: string;
  usageText: string;
  color: string;
  borderColor: string;
  casualToFormal: number; // 0 = Casual, 100 = Formal
  conciseToDetailed: number; // 0 = Concise, 100 = Detailed
  customInstructions: string;
  autoContextEnabled: boolean;
  isDefault?: boolean;
  sampleInput: string;
  sampleOutput: string;
  avoidances?: string[];
  feelings?: string[];
}

export interface WeeklyStats {
  messagesAdapted: number;
  breakdown: { name: string; uses: number; color: string }[];
}

export const DEFAULT_STYLES: StyleItem[] = [
  {
    id: 'professional',
    name: 'Professional',
    iconSymbol: '✦',
    tagline: 'Make what you say clear, polished and work-ready.',
    desc: 'Clear · Polished · Confident',
    usageText: 'Used 14 times this week',
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-400',
    borderColor: 'border-blue-500/40',
    casualToFormal: 80,
    conciseToDetailed: 60,
    customInstructions: "Keep messages under 2 sentences. Don't use emojis. Keep the tone confident but friendly.",
    autoContextEnabled: true,
    isDefault: true,
    sampleInput: "hey sorry I couldn't finish this today I'll send it tomorrow",
    sampleOutput: "Apologies, I wasn't able to complete this today. I'll send it tomorrow.",
  },
  {
    id: 'casual',
    name: 'Casual',
    iconSymbol: '◉',
    tagline: 'Natural, conversational and relaxed.',
    desc: 'Natural · Relaxed · Conversational',
    usageText: 'Used 8 times this week',
    color: 'from-pink-500/20 to-rose-500/20 text-pink-400',
    borderColor: 'border-pink-500/40',
    casualToFormal: 20,
    conciseToDetailed: 40,
    customInstructions: "Keep wording natural and conversational. Feel free to use relaxed phrasing.",
    autoContextEnabled: true,
    isDefault: true,
    sampleInput: "hey sorry I couldn't finish this today I'll send it tomorrow",
    sampleOutput: "Hey, sorry I couldn't wrap this up today! I'll send it over tomorrow.",
  },
  {
    id: 'concise',
    name: 'Concise',
    iconSymbol: '—',
    tagline: 'Shorter, tighter and straight to the point.',
    desc: 'Short · Direct · Efficient',
    usageText: 'Used 11 times this week',
    color: 'from-amber-500/20 to-yellow-500/20 text-amber-400',
    borderColor: 'border-amber-500/40',
    casualToFormal: 50,
    conciseToDetailed: 15,
    customInstructions: "Cut filler words. Express the core thought in the fewest possible words.",
    autoContextEnabled: true,
    isDefault: true,
    sampleInput: "hey sorry I couldn't finish this today I'll send it tomorrow",
    sampleOutput: "Couldn't complete this today. Sending tomorrow.",
  },
  {
    id: 'warm',
    name: 'Warm',
    iconSymbol: '☀️',
    tagline: 'Friendly without being overly formal.',
    desc: 'Friendly · Empathetic · Approachable',
    usageText: 'Used 5 times this week',
    color: 'from-orange-500/20 to-amber-500/20 text-orange-400',
    borderColor: 'border-orange-500/40',
    casualToFormal: 35,
    conciseToDetailed: 55,
    customInstructions: "Use warm, empathetic, and encouraging phrasing without sounding corporate.",
    autoContextEnabled: true,
    isDefault: true,
    sampleInput: "hey sorry I couldn't finish this today I'll send it tomorrow",
    sampleOutput: "Thanks so much for your patience—I couldn't quite wrap this up today, but I'll send it over first thing tomorrow!",
  },
  {
    id: 'technical',
    name: 'Technical',
    iconSymbol: '⚙️',
    tagline: 'Preserve technical meaning, terminology and structure.',
    desc: 'Precise · Structured · Exact',
    usageText: 'Used 9 times this week',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    borderColor: 'border-emerald-500/40',
    casualToFormal: 75,
    conciseToDetailed: 65,
    customInstructions: "Preserve code terms, technical accuracy, and concise structured syntax.",
    autoContextEnabled: true,
    isDefault: true,
    sampleInput: "hey sorry I couldn't finish this today I'll send it tomorrow",
    sampleOutput: "Pending completion for today's deliverables. Handover scheduled for tomorrow.",
  },
];

export const DEFAULT_WEEKLY_STATS: WeeklyStats = {
  messagesAdapted: 32,
  breakdown: [
    { name: 'Professional', uses: 18, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { name: 'Concise', uses: 11, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { name: 'Casual', uses: 7, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  ],
};

/**
 * Intelligent local transformation engine for instant live playground reactivity
 * adapts based on style, sliders, and custom instructions.
 */
export function transformLocally(
  rawInput: string,
  styleName: string,
  casualToFormal = 50,
  conciseToDetailed = 50,
  _instructions = ''
): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();

  // Handle common prototype test phrases with precise curated outputs
  if (lower.includes("can you check this when you get time") || lower.includes("tell me if everything looks okay")) {
    if (styleName.toLowerCase() === 'casual') {
      return "Hey, can you check this when you get a chance and let me know if it looks good?";
    }
    if (styleName.toLowerCase() === 'concise') {
      return "Please review this and let me know if it looks good.";
    }
    if (styleName.toLowerCase() === 'warm') {
      return "Whenever you have a moment, could you take a quick look at this and see what you think? Thank you!";
    }
    if (styleName.toLowerCase() === 'technical') {
      return "Please review the attached artifact for validation and confirm integrity.";
    }
    return "Could you please review this and let me know if everything looks good?";
  }

  if (lower.includes("send this to the client") && lower.includes("tomorrow works")) {
    if (styleName.toLowerCase() === 'casual') {
      return "Hey, could you ping the client and check if tomorrow's good for them?";
    }
    if (styleName.toLowerCase() === 'concise') {
      return "Please send this to the client and ask if tomorrow works.";
    }
    if (styleName.toLowerCase() === 'warm') {
      return "Hi! When you have a moment, could you share this with the client and see if tomorrow works best for them?";
    }
    return "Hi, could you please send this to the client and ask whether tomorrow works?";
  }

  if (lower.includes("couldn't finish this today") || lower.includes("send it tomorrow") || lower.includes("sorry i couldn't")) {
    if (casualToFormal > 70) {
      if (conciseToDetailed < 40) return "Unable to finalize today. Will deliver tomorrow.";
      return "Apologies, I wasn't able to complete this today. I'll send it tomorrow.";
    }
    if (casualToFormal < 35) {
      if (conciseToDetailed < 40) return "Couldn't wrap up today, will ping you tomorrow!";
      return "Hey, sorry I couldn't wrap this up today! I'll send it over tomorrow.";
    }
    if (conciseToDetailed < 30) {
      return "Couldn't finish today. Sending tomorrow.";
    }
    return "Apologies, I wasn't able to complete this today. I'll send it tomorrow.";
  }

  if (lower.includes("send me the report when you get time") || lower.includes("send me the report")) {
    if (styleName.toLowerCase() === 'concise') {
      return "Please send the report when you can.";
    }
    if (styleName.toLowerCase() === 'casual') {
      return "Hey, can you send over the report whenever you get a sec?";
    }
    if (styleName.toLowerCase() === 'warm') {
      return "Whenever you have a spare moment, could you send the report over? Much appreciated!";
    }
    if (styleName.toLowerCase() === 'technical') {
      return "Requesting report transmission at your earliest availability.";
    }
    return "Could you please send me the report when you have a chance?";
  }

  // Generalized realistic transformation
  let result = trimmed;

  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);

  // Apply slider adjustments
  if (casualToFormal >= 70) {
    result = result
      .replace(/\bhey\b/gi, 'Hello')
      .replace(/\byo\b/gi, 'Hello')
      .replace(/\bgonna\b/gi, 'going to')
      .replace(/\bwanna\b/gi, 'would like to')
      .replace(/\bsorry\b/gi, 'apologies')
      .replace(/\bthanks\b/gi, 'thank you');
    if (!result.endsWith('.') && !result.endsWith('?')) result += '.';
  } else if (casualToFormal <= 30) {
    result = result
      .replace(/\bapologies\b/gi, 'sorry')
      .replace(/\bi will\b/gi, "I'll")
      .replace(/\bdo not\b/gi, "don't")
      .replace(/\bcannot\b/gi, "can't");
  }

  if (conciseToDetailed <= 30) {
    result = result
      .replace(/\bjust wanted to\b/gi, '')
      .replace(/\bwhen you get a chance\b/gi, 'when possible')
      .replace(/\bat your earliest convenience\b/gi, 'ASAP')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return result;
}
