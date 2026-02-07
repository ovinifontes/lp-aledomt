/**
 * ============================================
 * NAVBAR SCROLL EFFECT
 * ============================================
 */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/**
 * ============================================
 * MOBILE MENU TOGGLE
 * ============================================
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (!menuToggle || !navLinks) return;
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });
    
    // Fechar menu ao clicar em um link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.textContent = '☰';
        });
    });
}

/**
 * ============================================
 * PHONE INPUT MASK
 * ============================================
 */
function initPhoneMask() {
    const phoneInput = document.getElementById('phone');
    
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        let formatted = value;
        if (value.length > 2) {
            formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        if (value.length > 7) {
            formatted = `${formatted.slice(0, 10)}-${formatted.slice(10)}`;
        }
        e.target.value = formatted;
    });
}

/**
 * ============================================
 * CONTACT FORM SUBMIT
 * ============================================
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value
        };
        
        console.log('Form Submitted:', formData);
        alert('Obrigado! Entraremos em contato em breve.');
        contactForm.reset();
    });
}

/**
 * ============================================
 * SCROLL ANIMATIONS
 * ============================================
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.service-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(card);
    });
}

/**
 * ============================================
 * UPDATE CURRENT YEAR
 * ============================================
 */
function updateCurrentYear() {
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}

/**
 * ============================================
 * SMOOTH SCROLL
 * ============================================
 */
function initSmoothScroll() {
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
}

/**
 * ============================================
 * LOGOS SLIDER ENHANCEMENT
 * ============================================
 */
function initLogosSlider() {
    const slider = document.getElementById('logosSlider');
    if (!slider) return;
    
    // Pausar animação no hover
    const wrapper = slider.closest('.logos-slider-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', () => {
            slider.style.animationPlayState = 'paused';
        });
        
        wrapper.addEventListener('mouseleave', () => {
            slider.style.animationPlayState = 'running';
        });
    }
    
    // Garantir que o slider tenha conteúdo duplicado para efeito infinito
    const logoItems = slider.querySelectorAll('.logo-item');
    if (logoItems.length > 0) {
        // Se não houver duplicatas suficientes, adicionar mais
        const firstHalf = Array.from(logoItems).slice(0, Math.ceil(logoItems.length / 2));
        if (firstHalf.length < logoItems.length) {
            firstHalf.forEach(item => {
                const clone = item.cloneNode(true);
                slider.appendChild(clone);
            });
        }
    }
}

/**
 * ============================================
 * SERVICE CARDS INTERACTIVE BEHAVIOR
 * ============================================
 */
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    const learnMoreButtons = document.querySelectorAll('.learn-more-btn');
    
    if (serviceCards.length === 0) return;
    
    // Verificar se é desktop ou mobile
    const isDesktop = () => window.innerWidth >= 968;
    
    // Função para remover todas as classes de estado
    function resetCards() {
        serviceCards.forEach(card => {
            card.classList.remove('expanded', 'compressed-left', 'compressed-right', 
                'compressed-stack-top', 'compressed-stack-bottom');
        });
    }
    
    // Função para expandir um card específico
    function expandCard(clickedCard) {
        const clickedService = clickedCard.dataset.service;
        const allServices = ['videos', 'sites', 'identidade'];
        const clickedIndex = allServices.indexOf(clickedService);
        
        if (isDesktop()) {
            // Desktop: expandir o clicado e comprimir os outros
            resetCards();
            clickedCard.classList.add('expanded');
            
            const otherCards = Array.from(serviceCards).filter(card => card !== clickedCard);
            
            if (clickedIndex === 0) {
                // Vídeos expandido - Sites e Identidade empilhados à direita
                // Ordenar por índice para manter ordem: Sites primeiro (top), Identidade depois (bottom)
                const sortedCards = otherCards.sort((a, b) => {
                    const aIndex = allServices.indexOf(a.dataset.service);
                    const bIndex = allServices.indexOf(b.dataset.service);
                    return aIndex - bIndex;
                });
                
                sortedCards.forEach((card, idx) => {
                    card.classList.add('compressed-right');
                    card.classList.add(idx === 0 ? 'compressed-stack-top' : 'compressed-stack-bottom');
                });
            } else if (clickedIndex === 2) {
                // Identidade expandido - Vídeos e Sites empilhados à esquerda
                // Ordenar por índice para manter ordem: Vídeos primeiro (top), Sites depois (bottom)
                const sortedCards = otherCards.sort((a, b) => {
                    const aIndex = allServices.indexOf(a.dataset.service);
                    const bIndex = allServices.indexOf(b.dataset.service);
                    return aIndex - bIndex;
                });
                
                sortedCards.forEach((card, idx) => {
                    card.classList.add('compressed-left');
                    card.classList.add(idx === 0 ? 'compressed-stack-top' : 'compressed-stack-bottom');
                });
            } else {
                // Sites expandido - Vídeos à esquerda, Identidade à direita (lados opostos)
                otherCards.forEach((card) => {
                    const cardService = card.dataset.service;
                    const cardIndex = allServices.indexOf(cardService);
                    
                    if (cardIndex < clickedIndex) {
                        card.classList.add('compressed-left');
                    } else {
                        card.classList.add('compressed-right');
                    }
                });
            }
        } else {
            // Mobile: comportamento accordion (mantém como está)
            const isExpanded = clickedCard.classList.contains('expanded');
            
            // Fechar todos os cards
            resetCards();
            
            // Se não estava expandido, expandir o clicado
            if (!isExpanded) {
                clickedCard.classList.add('expanded');
            }
        }
    }
    
    // Adicionar event listeners
    learnMoreButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const card = button.closest('.service-card');
            expandCard(card);
        });
    });
    
    // Também permitir clicar no card inteiro no desktop
    serviceCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Não expandir se clicar no botão (já tem handler próprio)
            if (e.target.closest('.learn-more-btn')) return;
            
            // No desktop, permitir clicar em qualquer lugar do card
            if (isDesktop()) {
                expandCard(card);
            }
        });
    });
    
    // Ajustar comportamento ao redimensionar a janela
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (!isDesktop()) {
                // No mobile, remover classes de compressão
                serviceCards.forEach(card => {
                    card.classList.remove('compressed-left', 'compressed-right');
                });
            }
        }, 250);
    });
}

/**
 * ============================================
 * INITIALIZE ALL FUNCTIONS
 * ============================================
 */
document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initMobileMenu();
    initPhoneMask();
    initContactForm();
    initScrollAnimations();
    updateCurrentYear();
    initSmoothScroll();
    initLogosSlider();
    initServiceCards();
});
