(() => {
    const body = document.body;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const intro = document.querySelector('.intro');
    const revealPage = () => {
        body.classList.remove('intro-active');
        body.classList.add('loaded');
    };
    if (reducedMotion || !intro) {
        intro?.remove();
        revealPage();
    } else {
        body.classList.add('intro-active');
        const revealTimer = setTimeout(revealPage, 1700);
        const removeTimer = setTimeout(() => intro.remove(), 2700);
        intro.addEventListener('click', () => {
            clearTimeout(revealTimer);
            clearTimeout(removeTimer);
            intro.classList.add('skip');
            revealPage();
            setTimeout(() => intro.remove(), 600);
        }, { once: true });
    }

    const navbar = document.querySelector('.navbar');
    const scrollUpBtn = document.querySelector('.scroll-up-btn');
    const onScroll = () => {
        navbar.classList.toggle('sticky', window.scrollY > 20);
        scrollUpBtn.classList.toggle('show', window.scrollY > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    scrollUpBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

    const menu = document.getElementById('menu');
    const menuBtn = document.querySelector('.menu-btn');
    const setMenu = (open) => {
        menu.classList.toggle('active', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.querySelector('i').className = open ? 'fas fa-xmark' : 'fas fa-bars';
    };
    menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('active')));
    menu.addEventListener('click', (event) => {
        if (event.target.closest('a')) setMenu(false);
    });

    const menuLinks = [...menu.querySelectorAll('a')];
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            menuLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('section[id]').forEach((section) => sectionObserver.observe(section));

    const startTyping = () => {
        if (typeof Typed === 'undefined') return;
        const options = {
            typeSpeed: 70,
            backSpeed: 40,
            backDelay: 1600,
            loop: true,
        };
        new Typed('.typing', {
            ...options,
            strings: ['Backend Engineer.', 'Spring Boot developer.', 'Kafka wrangler.', 'MCP server builder.', 'Arch Linux nerd.'],
        });
        new Typed('.typing-2', {
            ...options,
            strings: ['Backend Engineer.', 'Problem solver.', 'Linux enthusiast.'],
        });
    };
    if (reducedMotion) {
        document.querySelector('.typing').textContent = 'Backend Engineer.';
        document.querySelector('.typing-2').textContent = 'Backend Engineer.';
    } else {
        startTyping();
    }

    const hero = document.querySelector('.home');
    const heroArt = hero.querySelector('.hero-art img');
    const embers = hero.querySelector('.embers');
    if (!reducedMotion) {
        const ctx = embers.getContext('2d');
        const pointer = { x: 0, y: 0 };
        const shift = { x: 0, y: 0 };
        let particles = [];
        let heroVisible = true;
        let frame;

        const spawn = (anywhere) => ({
            x: Math.random() * embers.width,
            y: anywhere ? Math.random() * embers.height : embers.height + 10,
            r: (Math.random() * 1.6 + 0.6) * devicePixelRatio,
            vy: -(Math.random() * 0.5 + 0.25) * devicePixelRatio,
            sway: Math.random() * Math.PI * 2,
            alpha: Math.random() * 0.5 + 0.35,
            hue: Math.random() < 0.75 ? '220, 20, 60' : '255, 120, 110',
        });
        const resize = () => {
            embers.width = hero.clientWidth * devicePixelRatio;
            embers.height = hero.clientHeight * devicePixelRatio;
            const count = hero.clientWidth < 700 ? 16 : 32;
            particles = Array.from({ length: count }, () => spawn(true));
        };
        resize();
        window.addEventListener('resize', resize);

        if (window.matchMedia('(hover: hover)').matches) {
            hero.addEventListener('mousemove', (event) => {
                pointer.x = (event.clientX / window.innerWidth - 0.5) * -22;
                pointer.y = (event.clientY / window.innerHeight - 0.5) * -14;
            });
            hero.addEventListener('mouseleave', () => {
                pointer.x = 0;
                pointer.y = 0;
            });
        }

        const tick = () => {
            shift.x += (pointer.x - shift.x) * 0.06;
            shift.y += (pointer.y - shift.y) * 0.06;
            const scrollShift = Math.min(window.scrollY, hero.clientHeight) * 0.3;
            heroArt.style.transform = `translate3d(${shift.x.toFixed(2)}px, ${(shift.y + scrollShift).toFixed(2)}px, 0)`;

            ctx.clearRect(0, 0, embers.width, embers.height);
            ctx.globalCompositeOperation = 'lighter';
            particles.forEach((p, index) => {
                p.sway += 0.02;
                p.x += Math.sin(p.sway) * 0.3 * devicePixelRatio;
                p.y += p.vy;
                const fade = Math.min(1, p.y / (embers.height * 0.35));
                if (p.y < -10 || fade <= 0) particles[index] = spawn(false);
                const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
                glow.addColorStop(0, `rgba(${p.hue}, ${p.alpha * fade})`);
                glow.addColorStop(1, `rgba(${p.hue}, 0)`);
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
                ctx.fill();
            });
            frame = requestAnimationFrame(tick);
        };
        const run = () => {
            cancelAnimationFrame(frame);
            if (heroVisible && !document.hidden) frame = requestAnimationFrame(tick);
        };
        new IntersectionObserver(([entry]) => {
            heroVisible = entry.isIntersecting;
            run();
        }).observe(hero);
        document.addEventListener('visibilitychange', run);
    }

    const countUp = (el) => {
        const end = Number(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / 1400, 1);
            el.textContent = Math.round(end * (1 - Math.pow(1 - progress, 4))) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            if (!reducedMotion) entry.target.querySelectorAll('[data-count]').forEach(countUp);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal, section .title').forEach((el, index) => {
        if (el.classList.contains('reveal')) el.style.transitionDelay = `${(index % 4) * 80}ms`;
        revealObserver.observe(el);
    });

    const carousel = document.getElementById('carousel');
    const track = carousel.querySelector('.carousel-track');
    const cards = [...track.children];
    const dotsBox = carousel.querySelector('.carousel-dots');
    const dots = cards.map((card, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to project ${index + 1}`);
        dot.addEventListener('click', () => scrollToCard(index));
        dotsBox.appendChild(dot);
        return dot;
    });
    const currentIndex = () => {
        const left = track.scrollLeft;
        return cards.reduce((best, card, index) =>
            Math.abs(card.offsetLeft - track.offsetLeft - left) < Math.abs(cards[best].offsetLeft - track.offsetLeft - left) ? index : best, 0);
    };
    const scrollToCard = (index) => {
        const target = cards[(index + cards.length) % cards.length];
        track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
    };
    const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    const updateDots = () => {
        const active = atEnd() ? cards.length - 1 : currentIndex();
        dots.forEach((dot, index) => dot.classList.toggle('active', index === active));
    };
    track.addEventListener('scroll', () => requestAnimationFrame(updateDots), { passive: true });
    updateDots();
    carousel.querySelector('.prev').addEventListener('click', () => scrollToCard(currentIndex() - 1));
    carousel.querySelector('.next').addEventListener('click', () => scrollToCard(atEnd() ? 0 : currentIndex() + 1));

    let autoplay;
    const startAutoplay = () => {
        if (reducedMotion) return;
        clearInterval(autoplay);
        autoplay = setInterval(() => scrollToCard(atEnd() ? 0 : currentIndex() + 1), 4000);
    };
    carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', () => clearInterval(autoplay));
    track.addEventListener('touchstart', () => clearInterval(autoplay), { passive: true });
    startAutoplay();

    if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
        cards.forEach((card) => {
            card.addEventListener('mousemove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    const caseModal = document.getElementById('case-modal');
    const caseMedia = caseModal.querySelector('.case-media');
    const caseContent = caseModal.querySelector('.case-content');
    const openCase = (card) => {
        const template = document.getElementById(`case-${card.dataset.case}`);
        if (!template || typeof caseModal.showModal !== 'function') return false;
        caseMedia.replaceChildren(card.querySelector('.card-media').cloneNode(true));
        caseContent.replaceChildren(template.content.cloneNode(true));
        caseContent.querySelector('h3').id = 'case-title';
        clearInterval(autoplay);
        caseModal.showModal();
        caseModal.scrollTop = 0;
        return true;
    };
    track.addEventListener('click', (event) => {
        const card = event.target.closest('.card[data-case]');
        if (!card || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        if (openCase(card)) event.preventDefault();
    });
    caseModal.querySelector('.modal-close').addEventListener('click', () => caseModal.close());
    caseModal.addEventListener('click', (event) => {
        if (event.target === caseModal) caseModal.close();
    });
    caseModal.addEventListener('close', startAutoplay);
    window.openCase = (id) => {
        const card = track.querySelector(`.card[data-case="${id}"]`);
        return card ? openCase(card) : false;
    };

    const form = document.getElementById('contact-form');
    const status = document.getElementById('status');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = form.querySelector('button');
        button.disabled = true;
        status.className = '';
        status.textContent = 'Sending…';
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error(String(response.status));
            form.reset();
            status.className = 'success';
            status.textContent = 'Thanks! Your message has been sent.';
        } catch (error) {
            status.className = 'error';
            status.textContent = 'Oops! Something went wrong. Please email me directly.';
        } finally {
            button.disabled = false;
        }
    });

    document.getElementById('year').textContent = new Date().getFullYear();
})();
