// 主题管理
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = this.themeToggle?.querySelector('.theme-icon');
        this.init();
    }

    init() {
        this.loadTheme();
        this.bindEvents();
    }

    getSystemPreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getSavedTheme() {
        return localStorage.getItem('theme');
    }

    loadTheme() {
        const savedTheme = this.getSavedTheme();
        const systemPreference = this.getSystemPreference();
        const theme = savedTheme || systemPreference;
        
        this.setTheme(theme);
        this.updateIcon(theme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateIcon(theme);
    }

    updateIcon(theme) {
        if (!this.themeIcon) return;
        
        this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.setTheme(newTheme);
    }

    bindEvents() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getSavedTheme()) { // 只在用户没有手动设置时跟随系统
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// 阅读进度指示器
class ReadingProgress {
    constructor() {
        this.progressBar = null;
        this.init();
    }

    init() {
        if (document.querySelector('.post-content')) {
            this.createProgressBar();
            this.bindScrollEvent();
        }
    }

    createProgressBar() {
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'reading-progress';
        this.progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: var(--link-color);
            z-index: 9999;
            transition: width 0.2s ease;
        `;
        document.body.appendChild(this.progressBar);
    }

    bindScrollEvent() {
        window.addEventListener('scroll', () => {
            const postContent = document.querySelector('.post-content');
            if (!postContent) return;

            const contentHeight = postContent.offsetHeight;
            const contentTop = postContent.offsetTop;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            
            const scrollPercent = Math.min(100, Math.max(0, 
                (scrollTop - contentTop + windowHeight) / contentHeight * 100
            ));

            this.progressBar.style.width = scrollPercent + '%';
        });
    }
}

// 图片懒加载
class LazyLoader {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '200px 0px',
                threshold: 0.01
            });

            this.observeImages();
        } else {
            this.loadAllImages(); // 不支持 IntersectionObserver 时直接加载所有图片
        }
    }

    observeImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.observer.observe(img);
        });
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            
            // 加载完成后移除模糊效果（如果有）
            img.onload = () => {
                img.style.opacity = '1';
                img.style.filter = 'blur(0px)';
            };
        }
    }

    loadAllImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.loadImage(img);
        });
    }
}

// 代码块复制功能
class CodeBlockCopy {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('pre').forEach(pre => {
            this.addCopyButton(pre);
        });
    }

    addCopyButton(pre) {
        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.innerHTML = '📋';
        button.title = '复制代码';
        button.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 3px;
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;

        pre.style.position = 'relative';
        pre.appendChild(button);

        pre.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
        });

        pre.addEventListener('mouseleave', () => {
            button.style.opacity = '0';
        });

        button.addEventListener('click', () => {
            const code = pre.querySelector('code').innerText;
            this.copyToClipboard(code);
            
            const originalHTML = button.innerHTML;
            button.innerHTML = '✅';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
            }, 2000);
        });
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('复制失败:', err);
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    new ThemeManager();
    new ReadingProgress();
    new LazyLoader();
    new CodeBlockCopy();

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});