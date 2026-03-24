const COLOR_HEX = {
    red: '#d94444',
    blue: '#3366cc',
    yellow: '#ccaa00',
    green: '#33a85a',
    purple: '#8844cc',
    orange: '#e07820',
    cyan: '#1199aa',
    pink: '#cc3399',
};

const COLOR_EMOJI = {
    red: '🔴', blue: '🔵', yellow: '🟡', green: '🟢',
    purple: '🟣', orange: '🟠', cyan: '🩵', pink: '🩷',
};

function buildShareText({ guesses, codeLength, maxGuesses, isDaily, showGuesses }) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const header = isDaily ? `HEXCode - ${today}` : 'HEXCode - Random Game';
    const score = `${guesses.length}/${maxGuesses}`;
    const grid = guesses
        .map(({ code, feedback }) => {
            const { blackPegs, whitePegs } = feedback;
            const misses = codeLength - blackPegs - whitePegs;
            const pegs = '🟩'.repeat(blackPegs) + '🟨'.repeat(whitePegs) + '⬛'.repeat(misses);
            if (!showGuesses) return pegs;
            const colors = code.map(c => COLOR_EMOJI[c] ?? '⬜').join('');
            return `${colors} ${pegs}`;
        })
        .join('\n');
    return `${header}\n${score}\n\n${grid}`;
}

async function buildShareCanvas({ guesses, codeLength, maxGuesses, isDaily, showGuesses, elapsedSeconds }) {
    const DPR = 2;

    // Guess square size
    const SQ = 26;
    const SQ_GAP = 5;

    // 2×2 feedback grid — same total size as one guess square
    const MINI_GAP = 2;
    const MINI = (SQ - MINI_GAP) / 2; // = 12, so 2×12 + 2 = 26 = SQ

    const SEP = 14;
    const PADDING_X = 32;
    const PADDING_Y = 28;
    const ROW_GAP = 8;
    const ROW_H = SQ;

    const guessW = codeLength * SQ + (codeLength - 1) * SQ_GAP;
    const keyW = SQ; // 2×2 grid is SQ×SQ
    const rowContentW = showGuesses ? guessW + SEP + keyW : guessW;

    const W = Math.max(240, rowContentW + PADDING_X * 2);
    const rowX = (W - rowContentW) / 2;

    const LOGO_SIZE = 40;
    const headerAdvance = LOGO_SIZE + 8   // logo + gap
        + 19                               // date line
        + 24                               // score line
        + (elapsedSeconds != null ? 22 : 0); // time line

    const gridH = guesses.length * (ROW_H + ROW_GAP) - ROW_GAP;
    const H = PADDING_Y + headerAdvance + 20 + gridH + PADDING_Y;

    const canvas = document.createElement('canvas');
    canvas.width = W * DPR;
    canvas.height = H * DPR;

    const ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);

    // Background
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, W, H);

    let y = PADDING_Y;

    // Logo
    try {
        const logoImg = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = '/images/logo.svg';
        });
        ctx.drawImage(logoImg, (W - LOGO_SIZE) / 2, y, LOGO_SIZE, LOGO_SIZE);
    } catch {
        // Fallback to text if logo fails to load
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HEXCode', W / 2, y + 24);
    }
    y += LOGO_SIZE + 8;

    // Date or "Random Game"
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    ctx.fillStyle = '#888888';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isDaily ? today : 'Random Game', W / 2, y + 13);
    y += 19;

    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace, monospace';
    ctx.fillText(`${guesses.length} / ${maxGuesses}`, W / 2, y + 20);
    y += 24;

    // Time
    if (elapsedSeconds != null) {
        y += 4;
        const mins = Math.floor(elapsedSeconds / 60);
        const secs = String(elapsedSeconds % 60).padStart(2, '0');
        ctx.fillStyle = '#888888';
        ctx.font = '13px monospace, monospace';
        ctx.fillText(`${mins}:${secs}`, W / 2, y + 13);
        y += 18;
    }

    y += 20;

    for (const { code, feedback } of guesses) {
        const { blackPegs, whitePegs } = feedback;
        let x = rowX;

        // Guess color squares
        if (showGuesses) {
            code.forEach((color, i) => {
                ctx.fillStyle = COLOR_HEX[color] ?? '#555555';
                ctx.fillRect(x + i * (SQ + SQ_GAP), y, SQ, SQ);
            });
            x += guessW + SEP;
        }

        const dots = [
            ...Array(blackPegs).fill('hit'),
            ...Array(whitePegs).fill('close'),
            ...Array(codeLength - blackPegs - whitePegs).fill('miss'),
        ];

        if (showGuesses) {
            // 2×2 compressed feedback grid
            dots.forEach((type, i) => {
                const col = i % 2;
                const row = Math.floor(i / 2);
                ctx.fillStyle = type === 'hit' ? '#22c55e' : type === 'close' ? '#eab308' : '#3a3a3a';
                ctx.fillRect(x + col * (MINI + MINI_GAP), y + row * (MINI + MINI_GAP), MINI, MINI);
            });
        } else {
            // Horizontal square row
            dots.forEach((type, i) => {
                ctx.fillStyle = type === 'hit' ? '#22c55e' : type === 'close' ? '#eab308' : '#3a3a3a';
                ctx.fillRect(x + i * (SQ + SQ_GAP), y, SQ, SQ);
            });
        }

        y += ROW_H + ROW_GAP;
    }

    return canvas;
}

async function doShare({ guesses, codeLength, maxGuesses, isDaily, showGuesses, elapsedSeconds, onCopied }) {
    const canvas = await buildShareCanvas({ guesses, codeLength, maxGuesses, isDaily, showGuesses, elapsedSeconds });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const file = new File([blob], 'hexcode.png', { type: 'image/png' });

    // 1. Share image natively (mobile / PWA)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: 'HEXCode' });
            return;
        } catch (e) {
            if (e.name === 'AbortError') return;
        }
    }

    // 2. Share text natively
    if (navigator.share) {
        try {
            await navigator.share({ text: buildShareText({ guesses, codeLength, maxGuesses, isDaily, showGuesses }) });
            return;
        } catch (e) {
            if (e.name === 'AbortError') return;
        }
    }

    // 3. Download image as fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hexcode.png';
    a.click();
    URL.revokeObjectURL(url);
    onCopied?.();
}

export function useShareImage() {
    function shareResults(opts) {
        return doShare({ ...opts, showGuesses: false });
    }

    function shareReview(opts) {
        return doShare({ ...opts, showGuesses: true });
    }

    return { shareResults, shareReview };
}
