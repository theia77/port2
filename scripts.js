// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    
    // Set initial theme based on preference
    if (localStorage.getItem('theme') === 'light') {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeSwitch.checked = true;
    }
    
    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        }
        
        // Update 3D orb colors when theme changes
        updateOrbColors();
    });
    
    // Initialize 3D Orb
    let scene, camera, renderer, orb, orbGroup;
    let mouseX = 0, mouseY = 0;
    
    function initOrb() {
        // Create scene
        scene = new THREE.Scene();
        
        // Create camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('orb-canvas'),
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth / 2, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Create orb group
        orbGroup = new THREE.Group();
        scene.add(orbGroup);
        
        // Create main orb
        const geometry = new THREE.SphereGeometry(2, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00b4d8,
            emissive: 0x00b4d8,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.9,
            wireframe: false,
        });
        
        orb = new THREE.Mesh(geometry, material);
        orbGroup.add(orb);
        
        // Add outer glow
        const glowGeometry = new THREE.SphereGeometry(2.2, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00b4d8,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        orbGroup.add(glowMesh);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
        
        // Add point lights for highlights
        const pointLight1 = new THREE.PointLight(0x00b4d8, 1, 10);
        pointLight1.position.set(2, 2, 2);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x4361ee, 1, 10);
        pointLight2.position.set(-2, -2, 2);
        scene.add(pointLight2);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const width = window.innerWidth <= 992 ? window.innerWidth : window.innerWidth / 2;
            const height = window.innerHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            
            renderer.setSize(width, height);
        });
        
        // Handle mouse movement for interactive rotation
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Start animation loop
        animate();
    }
    
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate orb based on mouse position
        orbGroup.rotation.y += 0.003;
        orbGroup.rotation.x += 0.001;
        
        // Subtle movement based on mouse position
        orbGroup.rotation.y += (mouseX * 0.01 - orbGroup.rotation.y) * 0.05;
        orbGroup.rotation.x += (mouseY * 0.01 - orbGroup.rotation.x) * 0.05;
        
        renderer.render(scene, camera);
    }
    
    function updateOrbColors() {
        if (!orb) return;
        
        const isDarkMode = body.classList.contains('dark-mode');
        const mainColor = isDarkMode ? 0x00b4d8 : 0x4361ee;
        const glowColor = isDarkMode ? 0x00b4d8 : 0x3a0ca3;
        
        orb.material.color.setHex(mainColor);
        orb.material.emissive.setHex(mainColor);
        
        // Update glow mesh color
        orbGroup.children[1].material.color.setHex(glowColor);
        
        // Update point lights
        scene.children[3].color.setHex(isDarkMode ? 0x00b4d8 : 0x4361ee);
        scene.children[4].color.setHex(isDarkMode ? 0x90e0ef : 0x3a0ca3);
    }
    
    // Initialize orb
    initOrb();
    
    // Animate skill tags
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        const delay = parseFloat(tag.getAttribute('data-delay'));
        const randomX = Math.random() * 80 - 40; // -40 to 40%
        const randomY = Math.random() * 80 - 40; // -40 to 40%
        
        tag.style.left = `calc(50% + ${randomX}%)`;
        tag.style.top = `calc(50% + ${randomY}%)`;
        
        gsap.to(tag, {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: delay + 0.5,
            ease: "power3.out"
        });
        
        // Floating animation
        gsap.to(tag, {
            y: "+=10",
            duration: 2,
            repeat: -1,
            yoyo: true,
            delay: delay + 1.5,
            ease: "sine.inOut"
        });
    });
    
    // Initialize GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Timeline horizontal scroll
    const timelineTrack = document.getElementById('timeline-track');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timelineTrack && timelineItems.length > 0) {
        const totalWidth = Array.from(timelineItems).reduce((width, item) => {
            return width + item.offsetWidth + parseInt(window.getComputedStyle(item).marginRight);
        }, 0);
        
        gsap.to(timelineTrack, {
            x: () => -(totalWidth - window.innerWidth + 100),
            ease: "none",
            scrollTrigger: {
                trigger: ".timeline-section",
                start: "top center",
                end: "bottom top",
                scrub: 1,
                pin: true,
                anticipatePin: 1
            }
        });
        
        // Animate timeline items
        timelineItems.forEach((item, index) => {
            gsap.from(item, {
                y: 50,
                opacity: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: ".timeline-section",
                    start: `top+=${index * 100} bottom`,
                    end: "bottom top",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }
    
    // Initialize Starfield for Skills
    let stars = [];
    const skills = [
        { name: "AutoCAD", description: "Designed 3D infrastructure models with parametric components" },
        { name: "Python", description: "Built data analysis tools for structural engineering applications" },
        { name: "UI/UX Design", description: "Created intuitive interfaces for engineering software" },
        { name: "Data Science", description: "Applied machine learning to predict structural integrity" },
        { name: "Civil Engineering", description: "Specialized in sustainable infrastructure design" },
        { name: "Figma", description: "Prototyped digital solutions for construction management" },
        { name: "JavaScript", description: "Developed interactive web applications for project visualization" },
        { name: "BIM", description: "Building Information Modeling for collaborative construction projects" }
    ];
    
    function initStarfield() {
        const canvas = document.getElementById('starfield');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const container = document.getElementById('starfield-container');
        
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        // Create stars
        for (let i = 0; i < skills.length; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 3 + 2;
            const brightness = Math.random() * 0.5 + 0.5;
            
            stars.push({
                x,
                y,
                z: Math.random() * 1000,
                size,
                brightness,
                skill: skills[i]
            });
        }
        
        // Create connections between stars (constellations)
        const connections = [];
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const distance = Math.sqrt(
                    Math.pow(stars[i].x - stars[j].x, 2) + 
                    Math.pow(stars[i].y - stars[j].y, 2)
                );
                
                if (distance < canvas.width / 3) {
                    connections.push({
                        from: i,
                        to: j,
                        opacity: 0.2 - (distance / (canvas.width / 3)) * 0.2
                    });
                }
            }
        }
        
        // Handle star click
        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;
            
            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];
                const distance = Math.sqrt(
                    Math.pow(star.x - clickX, 2) + 
                    Math.pow(star.y - clickY, 2)
                );
                
                if (distance < star.size * 5) {
                    showSkillPopup(star);
                    break;
                }
            }
        });
        
        // Animation loop
        function animateStars() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw connections
            for (const connection of connections) {
                const from = stars[connection.from];
                const to = stars[connection.to];
                
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.strokeStyle = `rgba(${body.classList.contains('dark-mode') ? '0, 180, 216' : '67, 97, 238'}, ${connection.opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            // Draw stars
            for (const star of stars) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${body.classList.contains('dark-mode') ? '0, 180, 216' : '67, 97, 238'}, ${star.brightness})`;
                ctx.fill();
                
                // Draw glow
                const gradient = ctx.createRadialGradient(
                    star.x, star.y, star.size,
                    star.x, star.y, star.size * 4
                );
                gradient.addColorStop(0, `rgba(${body.classList.contains('dark-mode') ? '0, 180, 216' : '67, 97, 238'}, 0.3)`);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
            
            requestAnimationFrame(animateStars);
        }
        
        animateStars();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            
            // Reposition stars
            stars.forEach(star => {
                star.x = Math.random() * canvas.width;
                star.y = Math.random() * canvas.height;
            });
        });
    }
    
    function showSkillPopup(star) {
        const popup = document.getElementById('skill-popup');
        const title = document.getElementById('popup-title');
        const description = document.getElementById('popup-description');
        
        title.textContent = star.skill.name;
        description.textContent = star.skill.description;
        
        popup.style.left = `${star.x}px`;
        popup.style.top = `${star.y}px`;
        popup.style.display = 'block';
        
        gsap.from(popup, {
            scale: 0.5,
            opacity: 0,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
        
        document.querySelector('.close-popup').addEventListener('click', () => {
            gsap.to(popup, {
                scale: 0.5,
                opacity: 0,
                duration: 0.2,
                onComplete: () => {
                    popup.style.display = 'none';
                }
            });
        });
    }
    
    // Initialize starfield
    initStarfield();
    
    // Parallax effect for biomechanical section
    const parallaxItems = document.querySelectorAll('.parallax-item');
    
    if (parallaxItems.length > 0) {
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth - 0.5;
            const mouseY = e.clientY / window.innerHeight - 0.5;
            
            parallaxItems.forEach(item => {
                const depth = parseFloat(item.getAttribute('data-depth'));
                const moveX = mouseX * depth * 100;
                const moveY = mouseY * depth * 100;
                
                gsap.to(item, {
                    x: moveX,
                    y: moveY,
                    duration: 1,
                    ease: "power2.out"
                });
            });
        });
    }
    
    // Project card hover effects
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                y: -10,
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                duration: 0.3
            });
            
            gsap.to(card.querySelector('.card-content'), {
                y: 0,
                opacity: 1,
                duration: 0.3
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                y: 0,
                scale: 1,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                duration: 0.3
            });
            
            gsap.to(card.querySelector('.card-content'), {
                y: 30,
                opacity: 0.8,
                duration: 0.3
            });
        });
    });
    
    // Wormhole animation
    const wormhole = document.getElementById('wormhole');
    if (wormhole) {
        const rings = wormhole.querySelectorAll('.wormhole-ring');
        
        rings.forEach((ring, index) => {
            gsap.to(ring, {
                rotation: 360 * (index % 2 === 0 ? 1 : -1),
                transformOrigin: "center center",
                duration: 20 + index * 5,
                repeat: -1,
                ease: "none"
            });
        });
        
        // Mouse follow effect
        document.querySelector('.contact-section').addEventListener('mousemove', (e) => {
            const mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
            const mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
            
            gsap.to(wormhole, {
                x: mouseX,
                y: mouseY,
                duration: 1,
                ease: "power2.out"
            });
        });
    }
    
    // AR Button
    const arButton = document.getElementById('ar-button');
    if (arButton) {
        arButton.addEventListener('click', () => {
            alert('AR feature would launch here! This would use WebXR or 8th Wall to show the Sumoverse orb in your environment.');
        });
    }
    
    // Form submission with animation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('.submit-button');
            const originalText = submitButton.textContent;
            
            // Button animation
            gsap.to(submitButton, {
                scale: 0.95,
                duration: 0.1,
                onComplete: () => {
                    submitButton.textContent = "Sending...";
                    
                    gsap.to(submitButton, {
                        scale: 1,
                        duration: 0.3,
                        ease: "back.out(1.7)"
                    });
                    
                    // Simulate form submission
                    setTimeout(() => {
                        submitButton.textContent = "Message Sent!";
                        
                        gsap.to(submitButton, {
                            backgroundColor: "#4CAF50",
                            duration: 0.3
                        });
                        
                        // Reset form
                        setTimeout(() => {
                            contactForm.reset();
                            submitButton.textContent = originalText;
                            
                            gsap.to(submitButton, {
                                backgroundColor: "",
                                duration: 0.3
                            });
                        }, 2000);
                    }, 1500);
                }
            });
        });
    }
});
