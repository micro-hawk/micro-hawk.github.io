(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const range = (value, start, end) => clamp((value - start) / (end - start));

    const splitWords = (el) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach((node) => {
            const fragment = document.createDocumentFragment();
            node.textContent.split(/(\s+)/).forEach((part) => {
                if (!part) return;
                if (/^\s+$/.test(part)) {
                    fragment.append(part);
                    return;
                }
                const word = document.createElement('span');
                word.className = 'w';
                word.textContent = part;
                fragment.append(word);
            });
            node.replaceWith(fragment);
        });
        return [...el.querySelectorAll('.w')];
    };

    const hero = document.querySelector('.home');
    const heroContent = hero.querySelector('.max-width');
    const sections = [...document.querySelectorAll('section:not(.home)')].map((section) => ({
        section,
        content: section.querySelector('.max-width'),
        title: section.querySelector('.title'),
    }));
    const readers = [...document.querySelectorAll('[data-scroll-read]')].map((el) => ({ el, words: splitWords(el), lit: -1 }));
    const timeline = document.querySelector('.timeline');
    const jobs = [...document.querySelectorAll('.job')];

    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.append(progressBar);

    root.classList.add('scroll-fx');

    let queued = false;
    const update = () => {
        queued = false;
        const vh = window.innerHeight;
        const scrollMax = root.scrollHeight - vh;
        progressBar.style.transform = `scaleX(${scrollMax > 0 ? window.scrollY / scrollMax : 0})`;

        const heroExit = clamp(window.scrollY / (hero.offsetHeight * 0.75));
        heroContent.style.setProperty('--exit', heroExit.toFixed(3));

        sections.forEach(({ section, content, title }) => {
            const rect = section.getBoundingClientRect();
            if (rect.bottom < -vh * 0.2 || rect.top > vh * 1.2) return;
            const enter = range(vh - rect.top, 0, vh * 0.7);
            const exit = range(vh * 0.55 - rect.bottom, 0, vh * 0.55);
            content.style.setProperty('--enter', enter.toFixed(3));
            content.style.setProperty('--exit', exit.toFixed(3));
            if (title) {
                const titleRect = title.getBoundingClientRect();
                title.style.setProperty('--zoom', range(vh - titleRect.top, vh * 0.05, vh * 0.55).toFixed(3));
            }
        });

        readers.forEach((reader) => {
            const rect = reader.el.getBoundingClientRect();
            const progress = range(vh * 0.95 - rect.top, 0, rect.height + vh * 0.2);
            const lit = Math.round(progress * reader.words.length);
            if (lit === reader.lit) return;
            reader.words.forEach((word, index) => word.classList.toggle('lit', index < lit));
            reader.lit = lit;
        });

        if (timeline) {
            const rect = timeline.getBoundingClientRect();
            const fillLine = vh * 0.6;
            const fill = range(fillLine - rect.top, 0, rect.height);
            timeline.style.setProperty('--fill', fill.toFixed(3));
            jobs.forEach((job) => {
                const dot = job.querySelector('.job-dot').getBoundingClientRect();
                job.classList.toggle('lit', dot.top + dot.height / 2 < fillLine);
            });
        }
    };

    const queue = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
    };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    update();
})();
