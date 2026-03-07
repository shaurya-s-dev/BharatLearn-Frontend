// src/lib/activity.ts
// Tracks user activity in localStorage — works without login

export interface ActivityData {
  streak: number;
  lastStudyDate: string; // ISO date string YYYY-MM-DD
  streakHistory: string[]; // array of ISO date strings
  topicScores: Record<string, { correct: number; total: number; attempts: number }>;
  weeklyMins: Record<string, number>; // "YYYY-MM-DD" -> minutes
  totalTopicsDone: number;
  sessionStart: number | null; // timestamp
}

const KEY = "bl_activity";

function today() { return new Date().toISOString().slice(0, 10); }
function dayOfWeek() { return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()]; }

export function getActivity(): ActivityData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    streak: 0, lastStudyDate: "", streakHistory: [],
    topicScores: {}, weeklyMins: {},
    totalTopicsDone: 0, sessionStart: null,
  };
}

export function saveActivity(data: ActivityData) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

// Call when user does anything (quiz, debug, viva)
export function recordStudySession() {
  const data = getActivity();
  const t = today();

  // Update streak
  if (data.lastStudyDate !== t) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    if (data.lastStudyDate === yStr) {
      data.streak += 1;
    } else if (data.lastStudyDate !== t) {
      data.streak = 1;
    }
    data.lastStudyDate = t;
    if (!data.streakHistory.includes(t)) data.streakHistory.push(t);
  }

  // Add 5 mins per activity
  data.weeklyMins[t] = (data.weeklyMins[t] ?? 0) + 5;
  saveActivity(data);
}

// Call after quiz completed
export function recordQuizResult(topic: string, correct: number, total: number) {
  const data = getActivity();
  recordStudySession();

  if (!data.topicScores[topic]) {
    data.topicScores[topic] = { correct: 0, total: 0, attempts: 0 };
    data.totalTopicsDone += 1;
  }
  data.topicScores[topic].correct += correct;
  data.topicScores[topic].total   += total;
  data.topicScores[topic].attempts += 1;
  saveActivity(data);
}

// Get last 7 days activity for chart
export function getWeeklyActivity() {
  const data = getActivity();
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const result = days.map((day, i) => {
    const d = new Date();
    const dayOfW = d.getDay(); // 0=Sun
    const diff = i - (dayOfW === 0 ? 6 : dayOfW - 1);
    d.setDate(d.getDate() + diff);
    const key = d.toISOString().slice(0, 10);
    return { day, mins: data.weeklyMins[key] ?? 0 };
  });
  return result;
}

// Get mastery per topic (0-100)
export function getTopicMastery() {
  const data = getActivity();
  const topics = ["Variables","Loops","Functions","OOP","Recursion","DS&A","Arrays","Sorting"];
  return topics.map(name => {
    const s = data.topicScores[name];
    const pct = s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    return { name, pct };
  });
}

// Get 30-day streak array (1=studied, 0=not)
export function get30DayStreak() {
  const data = getActivity();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return data.streakHistory.includes(d.toISOString().slice(0, 10)) ? 1 : 0;
  });
}

export function getTotalMinsThisWeek() {
  const data = getActivity();
  const d = new Date();
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const key = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i).toISOString().slice(0, 10);
    total += data.weeklyMins[key] ?? 0;
  }
  return total;
}

export function getAvgMastery() {
  const mastery = getTopicMastery();
  const nonZero = mastery.filter(m => m.pct > 0);
  if (!nonZero.length) return 0;
  return Math.round(nonZero.reduce((s, m) => s + m.pct, 0) / nonZero.length);
}
