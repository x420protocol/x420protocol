document.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('.navbar-burger');
    const menu = document.querySelector('#navbarMenu');

    if (burger && menu) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-active');
        });
    }

    const navLinks = document.querySelectorAll('.navbar-item[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (burger && menu) {
                burger.classList.remove('is-active');
                menu.classList.remove('is-active');
            }
        });
    });

    hljs.highlightAll();

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .docs-card, .protocol-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    let scrolled = false;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            if (!scrolled) {
                navbar.style.boxShadow = '0 2px 10px rgba(30, 136, 229, 0.2)';
                scrolled = true;
            }
        } else {
            if (scrolled) {
                navbar.style.boxShadow = 'none';
                scrolled = false;
            }
        }
    });
});
