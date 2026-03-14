<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

// Matches the peg CSS colors the player sees in-game
const COLORS = ['#d94444', '#3366cc', '#ccaa00', '#33a85a', '#8844cc', '#e07820', '#1199aa', '#cc3399'];
const PARTICLE_COUNT = 140;
const DURATION = 3000;
const GRAVITY = 0.12;

const emit = defineEmits(['done']);
const canvasRef = ref(null);
let animFrame = null;
let startTime = null;

function rand(min, max) {
    return min + Math.random() * (max - min);
}

function createParticle(cx, cy) {
    const angle = Math.random() * Math.PI * 2;
    const speed = rand(3, 11);
    return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(2, 5), // upward bias
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        w: rand(6, 14),
        h: rand(4, 8),
        rotation: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.18, 0.18),
        isCircle: Math.random() < 0.35,
    };
}

onMounted(() => {
    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle(cx, cy));

    function draw(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = elapsed / DURATION;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fade out in final 30%
        const alpha = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

        for (const p of particles) {
            p.vy += GRAVITY;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;

            if (p.isCircle) {
                ctx.beginPath();
                ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            }

            ctx.restore();
        }

        if (elapsed < DURATION) {
            animFrame = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            window.removeEventListener('resize', resize);
            emit('done');
        }
    }

    animFrame = requestAnimationFrame(draw);
});

onUnmounted(() => {
    if (animFrame) cancelAnimationFrame(animFrame);
});
</script>

<template>
    <canvas ref="canvasRef" class="confetti-canvas" />
</template>

<style scoped>
.confetti-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
}
</style>
