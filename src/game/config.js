export const MODES = {
    classic: {
        CODE_LENGTH: 4,
        MAX_GUESSES: 10,
        COLORS: ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'cyan', 'pink'],
    },
    quick: {
        CODE_LENGTH: 3,
        MAX_GUESSES: 6,
        COLORS: ['red', 'blue', 'yellow', 'green', 'purple', 'orange'],
    },
};

// Legacy alias — prefer MODES where possible
export const CONFIG = MODES.classic;
