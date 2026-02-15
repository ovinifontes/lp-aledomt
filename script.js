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
 * SUPABASE INITIALIZATION
 * ============================================
 */
const SUPABASE_URL = 'https://fvifzmpksrdivkorurdc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2aWZ6bXBrc3JkaXZrb3J1cmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NTA0MDksImV4cCI6MjA4NjIyNjQwOX0.e7ediXoLeUUnMtAZwyRSy2lG52svvVJY4dJ0f8nBK-A';

// URL do webhook
const WEBHOOK_URL = 'https://n8n00-vini-n8n.hq6fn5.easypanel.host/webhook/captura_lp_geral_aledomt';

let supabaseClient = null;

function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
}

/**
 * ============================================
 * PHONE NUMBER FORMATTER
 * ============================================
 */
function formatPhoneNumber(phone) {
    // Remove todos os caracteres não numéricos
    let numbers = phone.replace(/\D/g, '');
    
    // Se já começa com 55, remove para reprocessar
    if (numbers.startsWith('55')) {
        numbers = numbers.substring(2);
    }
    
    // Remove o 0 inicial se houver (caso tenha digitado 065...)
    if (numbers.startsWith('0')) {
        numbers = numbers.substring(1);
    }
    
    // Pega o DDD (primeiros 2 dígitos)
    const ddd = numbers.substring(0, 2);
    
    // Pega o resto do número
    let rest = numbers.substring(2);
    
    // Se não começar com 9, adiciona o 9
    if (!rest.startsWith('9')) {
        // Se o primeiro dígito não for 9, adiciona 9 no início
        rest = '9' + rest;
    }
    
    // Limita a 9 dígitos após o 9 (total de 10 dígitos: 9 + 8 dígitos)
    if (rest.length > 10) {
        rest = rest.substring(0, 10);
    }
    
    // Formato final: 55 + DDD + 9 + resto
    return `55${ddd}${rest}`;
}

/**
 * ============================================
 * WEBHOOK SENDER
 * ============================================
 */
async function sendWebhook(name, phone) {
    if (!WEBHOOK_URL) {
        console.warn('Webhook URL não configurada');
        return;
    }
    
    try {
        const webhookData = {
            nome: name,
            telefone: phone,
            site: 'aledomt_lp_geral'
        };
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData)
        });
        
        if (!response.ok) {
            throw new Error(`Webhook falhou: ${response.status}`);
        }
        
        console.log('Webhook enviado com sucesso:', webhookData);
    } catch (error) {
        console.error('Erro ao enviar webhook:', error);
        // Não bloqueia o fluxo se o webhook falhar
    }
}

/**
 * ============================================
 * CONTACT FORM SUBMIT
 * ============================================
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = contactForm.querySelector('.btn-submit');
        const originalButtonText = submitButton.textContent;
        
        // Desabilitar botão e mostrar loading
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        
        const rawPhone = document.getElementById('phone').value.trim();
        const formattedPhone = formatPhoneNumber(rawPhone);
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: formattedPhone
        };
        
        try {
            // Salvar no Supabase
            if (supabaseClient) {
                const { data, error } = await supabaseClient
                    .from('captura_aledomt_lp_geral')
                    .insert([
                        {
                            nome: formData.name,
                            telefone: formData.phone,
                            created_at: new Date().toISOString()
                        }
                    ])
                    .select();
                
                if (error) {
                    throw error;
                }
                
                console.log('Dados salvos no Supabase:', data);
                
                // Enviar webhook após salvar com sucesso
                await sendWebhook(formData.name, formData.phone);
                
                alert('Obrigado! Entraremos em contato em breve.');
                contactForm.reset();
            } else {
                throw new Error('Supabase não inicializado');
            }
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            alert('Ops! Ocorreu um erro ao enviar seus dados. Por favor, tente novamente ou entre em contato pelo WhatsApp.');
        } finally {
            // Reabilitar botão
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
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
    initSupabase();
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
