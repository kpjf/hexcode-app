import { ref } from 'vue';
import { STORY_LEVELS } from './storyLevels.js';
import { storyApi, legacyStoryApi } from '../utils/auth-client.js';
import { useAuthStore } from '../stores/auth.js';
import { todayStr } from '../utils/date.js';

const PROGRESS_KEY = 'story-progress';
const ATTEMPTS_KEY = 'story-attempts';
export const MAX_DAILY_ATTEMPTS = 3;

function loadProgress() {
    try {
        return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch {
        return {};
    }
}

function saveProgress(data) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

function loadAttempts() {
    try {
        return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '{}');
    } catch {
        return {};
    }
}

function saveAttempts(data) {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data));
}

function emptyProgress() {
    return { highestUnlocked: 1, coins: 0, completedLevels: [] };
}

function starsForCompletion(guesses, maxGuesses, coinsSpent) {
    if (guesses <= Math.ceil(maxGuesses * 0.4) && coinsSpent === 0) return 3;
    if (guesses <= Math.ceil(maxGuesses * 0.6)) return 2;
    return 1;
}

export function useStoryMode() {
    const raw = loadProgress();
    const progress = ref({ ...emptyProgress(), ...raw });

    // Assemble the full story document persisted to zuul-data. dailyAttempts is
    // rebuilt from the local attempts map (keyed `${levelId}-${YYYY-MM-DD}`).
    function buildStoryDoc() {
        const attemptsMap = loadAttempts();
        const dailyAttempts = Object.entries(attemptsMap).map(([key, attemptsUsed]) => {
            const dash = key.indexOf('-');
            return { levelId: Number(key.slice(0, dash)), date: key.slice(dash + 1), attemptsUsed };
        });
        return {
            coins: progress.value.coins ?? 0,
            storyMode: {
                highestUnlocked: progress.value.highestUnlocked ?? 1,
                completedLevels: progress.value.completedLevels ?? [],
                dailyAttempts,
            },
        };
    }

    // Best-effort write of the whole story doc — replaces the old granular
    // /complete, /attempt and /coins endpoints (zuul-data is a dumb store; the
    // client already owns all the logic, so one PUT of the result is enough).
    function persist() {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) return;
        storyApi.save(buildStoryDoc()).catch(() => {});
    }

    function getLevelState(levelId) {
        if (progress.value.completedLevels?.some((l) => l.levelId === levelId)) return 'completed';
        if (levelId <= (progress.value.highestUnlocked ?? 1)) return 'available';
        return 'locked';
    }

    function getAttemptsToday(levelId) {
        const key = `${levelId}-${todayStr()}`;
        return loadAttempts()[key] ?? 0;
    }

    function canAttempt(levelId) {
        if (getLevelState(levelId) === 'locked') return false;
        return getAttemptsToday(levelId) < MAX_DAILY_ATTEMPTS;
    }

    function useAttempt(levelId) {
        const key = `${levelId}-${todayStr()}`;
        const attempts = loadAttempts();
        attempts[key] = (attempts[key] ?? 0) + 1;
        saveAttempts(attempts);
        persist();
    }

    function completeLevel(levelId, guesses, maxGuesses, timeSeconds, coinsSpent = 0) {
        const level = STORY_LEVELS.find((l) => l.id === levelId);
        if (!level) return { coinsEarned: 0, stars: 1 };

        let coinsEarned = level.coinsReward;
        if (guesses <= Math.ceil(maxGuesses * 0.5)) coinsEarned += 10;
        if (guesses <= 2) coinsEarned += 25;
        if (coinsSpent === 0) coinsEarned += 5;

        const stars = starsForCompletion(guesses, maxGuesses, coinsSpent);
        const completedAt = new Date().toISOString();
        const entry = { levelId, guesses, timeSeconds, coinsEarned, coinsSpent, stars, completedAt };

        const idx = progress.value.completedLevels.findIndex((l) => l.levelId === levelId);
        if (idx >= 0) {
            progress.value.completedLevels[idx] = entry;
        } else {
            progress.value.completedLevels.push(entry);
        }

        if (levelId >= (progress.value.highestUnlocked ?? 1)) {
            progress.value.highestUnlocked = levelId + 1;
        }

        progress.value.coins = (progress.value.coins ?? 0) + coinsEarned - coinsSpent;
        saveProgress(progress.value);
        persist();

        return { coinsEarned, stars };
    }

    function getStars(levelId) {
        const completion = progress.value.completedLevels?.find((l) => l.levelId === levelId);
        if (!completion) return 0;
        return completion.stars ?? 1;
    }

    function getCompletedLevel(levelId) {
        return progress.value.completedLevels?.find((l) => l.levelId === levelId) ?? null;
    }

    // Sync server data down on login (with one-time migration from hexcode-api)
    async function syncFromServer() {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) return;
        try {
            let data = await storyApi.get(); // { coins, storyMode } | null

            // One-time migration: pull the player's old hexcode-api progress into zuul-data.
            if (!data?.storyMode) {
                const old = await legacyStoryApi.get();
                if (old?.storyMode) {
                    data = { coins: old.coins ?? 0, storyMode: old.storyMode };
                    await storyApi.save(data).catch(() => {});
                }
            }

            // Nothing on the server yet — push local progress up so it isn't lost.
            if (!data?.storyMode) {
                const hasLocal =
                    (progress.value.completedLevels?.length ?? 0) > 0 ||
                    (progress.value.highestUnlocked ?? 1) > 1 ||
                    (progress.value.coins ?? 0) > 0;
                if (hasLocal) persist();
                return;
            }

            const server = data.storyMode;
            const local = progress.value;

            // Merge: take the furthest progress
            const mergedHighest = Math.max(local.highestUnlocked ?? 1, server.highestUnlocked ?? 1);

            // Merge completedLevels: keep best stars per level
            const merged = [...(local.completedLevels ?? [])];
            for (const sl of server.completedLevels ?? []) {
                const li = merged.findIndex((l) => l.levelId === sl.levelId);
                if (li >= 0) {
                    if ((sl.stars ?? 0) > (merged[li].stars ?? 0)) merged[li] = sl;
                } else {
                    merged.push(sl);
                }
            }

            progress.value = {
                highestUnlocked: mergedHighest,
                coins: data.coins ?? local.coins ?? 0,
                completedLevels: merged,
            };
            saveProgress(progress.value);
        } catch {
            // best-effort
        }
    }

    // Award coins from non-story games (daily/random wins)
    function awardCoins(amount) {
        progress.value.coins = (progress.value.coins ?? 0) + amount;
        saveProgress(progress.value);
        persist();
    }

    return {
        progress,
        getLevelState,
        getAttemptsToday,
        canAttempt,
        useAttempt,
        completeLevel,
        getStars,
        getCompletedLevel,
        syncFromServer,
        awardCoins,
    };
}
