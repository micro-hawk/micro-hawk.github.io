(() => {
    const music = document.getElementById('bgMusic');
    const button = document.getElementById('sound-btn');
    const label = button.querySelector('.sound-label');
    let soundOn = false;
    let context;

    const getContext = () => {
        if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
        if (context.state === 'suspended') context.resume();
        return context;
    };

    const tick = () => {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.035, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
    };

    const slash = () => {
        const ctx = getContext();
        const duration = 0.22;
        const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 6;
        filter.frequency.setValueAtTime(900, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(6500, ctx.currentTime + duration);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        noise.connect(filter).connect(gain).connect(ctx.destination);
        noise.start();
    };

    const setSound = (on) => {
        soundOn = on;
        button.classList.toggle('on', on);
        button.setAttribute('aria-pressed', String(on));
        button.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
        label.textContent = on ? 'sound on' : 'sound off';
        if (on) {
            music.volume = 0.6;
            music.play().catch(() => setSound(false));
            slash();
        } else {
            music.pause();
        }
    };

    button.addEventListener('click', () => setSound(!soundOn));

    document.addEventListener('sfx', (event) => {
        if (!soundOn) return;
        if (event.detail === 'slash') slash();
        else tick();
    });

    let lastHover = null;
    document.addEventListener('pointerover', (event) => {
        if (!soundOn || event.pointerType !== 'mouse') return;
        const target = event.target.closest('a, button, .skill-icons span');
        if (target && target !== lastHover && target !== button) tick();
        lastHover = target;
    });

    document.addEventListener('click', (event) => {
        if (!soundOn) return;
        const target = event.target.closest('a, button');
        if (target && target !== button) slash();
    });
})();
