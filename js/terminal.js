(() => {
    const term = document.getElementById('term');
    const out = document.getElementById('term-out');
    const form = document.getElementById('term-form');
    const input = document.getElementById('term-input');
    const body = document.getElementById('term-body');
    if (!term || typeof term.showModal !== 'function') {
        document.querySelectorAll('.term-btn, .term-hint').forEach((el) => el.remove());
        return;
    }

    const EMAIL = 'dasvikas0071@gmail.com';
    const LINKS = {
        github: 'https://github.com/micro-hawk',
        linkedin: 'https://linkedin.com/in/microhawk',
    };
    const resumeUrl = () => document.querySelector('a[href^="resume/"]').href;
    const sfx = (kind) => document.dispatchEvent(new CustomEvent('sfx', { detail: kind }));

    const text = (selector, root = document) => root.querySelector(selector)?.textContent.trim() ?? '';
    const projects = () => [...document.querySelectorAll('.card[data-case]')].map((card) => ({
        id: card.dataset.case,
        name: text('.card-body .text', card),
        summary: text('.card-body p', card),
        href: card.href,
    }));
    const jobs = () => [...document.querySelectorAll('.job')].map((job) => ({
        role: text('h3', job),
        company: text('.company', job),
        date: text('.date', job),
    }));
    const skills = () => [...document.querySelectorAll('.skill-group')].map((group) => ({
        name: text('h3', group),
        items: [...group.querySelectorAll('.skill-icons span')].map((span) => span.textContent.trim()),
    }));

    const line = (...parts) => {
        const row = document.createElement('div');
        parts.forEach((part) => {
            if (typeof part === 'string') {
                row.append(part);
                return;
            }
            const el = document.createElement(part.href ? 'a' : 'span');
            el.textContent = part.text;
            if (part.cls) el.className = part.cls;
            if (part.href) {
                el.href = part.href;
                if (!part.href.startsWith('mailto:')) {
                    el.target = '_blank';
                    el.rel = 'noopener';
                }
            }
            row.append(el);
        });
        out.append(row);
    };
    const accent = (value) => ({ text: value, cls: 't-accent' });
    const muted = (value) => ({ text: value, cls: 't-muted' });
    const link = (value, href) => ({ text: value, href });

    const commands = {
        help: {
            about: 'list commands',
            run: () => {
                Object.entries(commands).forEach(([name, cmd]) => {
                    if (cmd.about) line(accent(name.padEnd(14)), muted(cmd.about));
                });
                line(muted('tip: ↑/↓ for history, Tab to autocomplete, Esc to close'));
            },
        },
        whoami: {
            about: 'who is this guy?',
            run: () => {
                line(accent('Vikas Das'), ' · Senior Backend Engineer');
                line('Java, Spring Boot and Kafka microservices for 700+ clients and 500K+ users.');
                line('Currently building MCP servers so AI agents can work with production data.');
            },
        },
        ls: {
            about: 'list projects',
            run: () => projects().forEach((project) => line(accent(project.id.padEnd(12)), project.name)),
        },
        projects: {
            about: 'projects with one-liners',
            run: () => projects().forEach((project) => {
                line(accent(project.name));
                line(muted(`  ${project.summary}`));
            }),
        },
        open: {
            about: 'open <project|resume|github|linkedin>',
            run: (args) => {
                const target = (args[0] || '').toLowerCase();
                if (!target) return line('usage: open <project|resume|github|linkedin>. Try ', accent('ls'), ' for project names.');
                if (target === 'resume') return go(resumeUrl(), 'resume');
                if (LINKS[target]) return go(LINKS[target], target);
                const project = projects().find((p) => p.id === target || p.name.toLowerCase().replace(/\s+/g, '') === target);
                if (!project) return line(`open: ${target}: no such project. Try `, accent('ls'), '.');
                line(`opening case study for ${project.name}…`);
                sfx('slash');
                setTimeout(() => {
                    term.close();
                    document.getElementById('projects').scrollIntoView();
                    window.openCase?.(project.id);
                }, 350);
            },
        },
        experience: {
            about: 'where I have worked',
            run: () => jobs().forEach((job) => line(accent(job.date.padEnd(22)), `${job.role} @ ${job.company}`)),
        },
        skills: {
            about: 'cat skills.txt',
            run: () => skills().forEach((group) => {
                line(accent(group.name));
                line(muted(`  ${group.items.join(' · ')}`));
            }),
        },
        resume: {
            about: 'open my resume',
            run: () => go(resumeUrl(), 'resume'),
        },
        contact: {
            about: 'how to reach me',
            run: () => {
                line('email     ', link(EMAIL, `mailto:${EMAIL}`));
                line('github    ', link('github', LINKS.github));
                line('linkedin  ', link('linkedin', LINKS.linkedin));
            },
        },
        neofetch: {
            about: 'system info',
            run: () => {
                const art = ['      /\\      ', '     /  \\     ', '    /\\   \\    ', '   /      \\   ', '  /   ,,   \\  ', ' /   |  |  -\\ ', '/_-\'\'    \'\'-_\\'];
                const info = [
                    [accent('vikas'), '@', accent('arch')],
                    [muted('-----------')],
                    [accent('OS'), ': Arch Linux'],
                    [accent('WM'), ': AwesomeWM (my own config)'],
                    [accent('Role'), ': Senior Backend Engineer'],
                    [accent('Uptime'), `: ${new Date().getFullYear() - 2022} years shipping backend`],
                    [accent('Stack'), ': Java · Spring Boot · Kafka'],
                    [accent('Data'), ': PostgreSQL · Redis · Elasticsearch'],
                ];
                if (body.clientWidth < 560) {
                    info.forEach((parts) => line(...parts));
                    return;
                }
                const rows = Math.max(art.length, info.length);
                for (let i = 0; i < rows; i++) line({ text: art[i] || ' '.repeat(14), cls: 't-logo' }, '  ', ...(info[i] || []));
            },
        },
        sudo: {
            run: (args) => {
                if (args.join(' ').toLowerCase() === 'hire vikas') {
                    sfx('slash');
                    line(muted('[sudo] password for recruiter: ********'));
                    line(accent('✔ access granted.'), ' Great choice.');
                    line('Drop me a line at ', link(EMAIL, `mailto:${EMAIL}`), ' and let\'s talk.');
                    return;
                }
                line('recruiter is not in the sudoers file. This incident will be reported. ', muted('(try: sudo hire vikas)'));
            },
        },
        clear: { about: 'clear the screen', run: () => out.replaceChildren() },
        exit: { about: 'close the terminal', run: () => term.close() },
        history: { run: () => history.forEach((cmd, index) => line(muted(String(index + 1).padStart(3)), `  ${cmd}`)) },
        pwd: { run: () => line('/home/vikas/portfolio') },
        date: { run: () => line(new Date().toString()) },
        echo: { run: (args) => line(args.join(' ')) },
        cat: {
            run: (args) => {
                const file = args[0] || '';
                if (file.startsWith('skills')) return commands.skills.run();
                if (file.startsWith('experience')) return commands.experience.run();
                if (file.startsWith('resume')) return commands.resume.run();
                line(`cat: ${file || '?'}: No such file. Try `, accent('cat skills.txt'), '.');
            },
        },
        cd: { run: () => line('there is only one directory here, and it is pretty great.') },
        rm: { run: () => line('nice try. ', muted('this portfolio is immutable.')) },
        vim: { run: () => line('you are now stuck in vim. just kidding: ', accent('exit'), ' works here.') },
    };
    commands.about = { run: commands.whoami.run };
    commands.hire = { run: () => commands.sudo.run(['hire', 'vikas']) };

    const go = (url, label) => {
        line(`opening ${label}…`);
        sfx('slash');
        window.open(url, '_blank', 'noopener');
    };

    const history = [];
    let historyIndex = 0;

    const run = (raw) => {
        const value = raw.trim();
        line({ text: 'vikas@arch:~$ ', cls: 't-prompt' }, value);
        if (!value) return;
        history.push(value);
        historyIndex = history.length;
        const [name, ...args] = value.split(/\s+/);
        const command = commands[name.toLowerCase()];
        if (command) command.run(args);
        else line(`${name}: command not found. Type `, accent('help'), '.');
    };

    const banner = () => {
        line(accent('Vikas Das'), muted(' · portfolio shell'));
        line('Type ', accent('help'), ' to see what you can do, or try ', accent('neofetch'), '.');
        line(' ');
    };

    let lastFocus = null;
    const open = () => {
        if (term.open) return;
        lastFocus = document.activeElement;
        if (!out.childElementCount) banner();
        term.showModal();
        input.focus();
        sfx('tick');
    };
    term.addEventListener('close', () => lastFocus?.focus?.());

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        run(input.value);
        input.value = '';
        sfx('tick');
        body.scrollTop = body.scrollHeight;
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)));
            input.value = history[historyIndex] ?? '';
        } else if (event.key === 'Tab') {
            event.preventDefault();
            const [name, ...rest] = input.value.split(' ');
            const pool = rest.length ? ['resume', 'github', 'linkedin', ...projects().map((p) => p.id)] : Object.keys(commands);
            const partial = rest.length ? rest[rest.length - 1] : name;
            const matches = pool.filter((option) => option.startsWith(partial.toLowerCase()));
            if (matches.length === 1) {
                input.value = rest.length ? [name, ...rest.slice(0, -1), matches[0]].join(' ') : `${matches[0]} `;
            } else if (matches.length > 1) {
                line(muted(matches.join('  ')));
                body.scrollTop = body.scrollHeight;
            }
        } else if (event.key === 'l' && event.ctrlKey) {
            event.preventDefault();
            out.replaceChildren();
        }
    });

    body.addEventListener('click', () => {
        if (!window.getSelection()?.toString()) input.focus();
    });
    term.querySelector('.modal-close').addEventListener('click', () => term.close());
    term.addEventListener('click', (event) => {
        if (event.target === term) term.close();
    });
    document.querySelectorAll('.term-btn, .term-open').forEach((button) => button.addEventListener('click', open));
    document.addEventListener('keydown', (event) => {
        if (event.key !== '`' || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.target.closest('input, textarea, [contenteditable="true"]')) return;
        event.preventDefault();
        open();
    });
})();
