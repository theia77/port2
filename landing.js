document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle-checkbox');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        htmlElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
        initParticles('dark');
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        themeToggle.checked = false;
        initParticles('light');
    }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateParticles('dark');
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            updateParticles('light');
        }
    });
    
    // Particle Background
    function initParticles(theme) {
        const particleContainer = document.getElementById('particles');
        const particleCount = window.innerWidth < 768 ? 30 : 60;
        
        // Clear existing particles
        particleContainer.innerHTML = '';
        
        for (let i = 0; i < particleCount; i++) {
            createParticle(particleContainer, theme);
        }
    }
    
    function createParticle(container, theme) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 3 + 1;
        
        // Random opacity
        const opacity = Math.random() * 0.5 + 0.1;
        
        // Random animation duration
        const duration = Math.random() * 20 + 10;
        
        // Set styles
        particle.style.cssText = `
            position: absolute;
            top: ${posY}%;
            left: ${posX}%;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            opacity: ${opacity};
            animation: float ${duration}s infinite ease-in-out;
        `;
        
        // Set color based on theme
        if (theme === 'dark') {
            const hue = Math.random() > 0.5 ? '271' : '342'; // Purple or Pink
            particle.style.backgroundColor = `hsla(${hue}, 100%, 70%, ${opacity})`;
        } else {
            const hue = Math.random() > 0.5 ? '248' : '351'; // Lighter Purple or Pink
            particle.style.backgroundColor = `hsla(${hue}, 100%, 60%, ${opacity})`;
        }
        
        container.appendChild(particle);
    }
    
    function updateParticles(theme) {
        const particles = document.querySelectorAll('.particle');
        
        particles.forEach(particle => {
            const opacity = parseFloat(particle.style.opacity);
            
            if (theme === 'dark') {
                const hue = Math.random() > 0.5 ? '271' : '342'; // Purple or Pink
                particle.style.backgroundColor = `hsla(${hue}, 100%, 70%, ${opacity})`;
            } else {
                const hue = Math.random() > 0.5 ? '248' : '351'; // Lighter Purple or Pink
                particle.style.backgroundColor = `hsla(${hue}, 100%, 60%, ${opacity})`;
            }
        });
    }
    
    // Add floating animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translateY(0) translateX(0);
            }
            25% {
                transform: translateY(-20px) translateX(10px);
            }
            50% {
                transform: translateY(0) translateX(20px);
            }
            75% {
                transform: translateY(20px) translateX(10px);
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // Resize event for particles
    window.addEventListener('resize', () => {
        const theme = htmlElement.getAttribute('data-theme');
        initParticles(theme);
    });
    
    // Add entrance animation
    document.body.classList.add('loaded');
});
