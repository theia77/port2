document.addEventListener('DOMContentLoaded', function() {
    // Universe Toggle (Light/Dark Mode)
    const universeToggle = document.getElementById('universe-toggle-checkbox');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'light') {
        htmlElement.setAttribute('data-theme', 'light');
        universeToggle.checked = true;
    } else {
        htmlElement.setAttribute('data-theme', 'dark');
        universeToggle.checked = false;
    }
    
    universeToggle.addEventListener('change', function() {
        if (this.checked) {
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            updateOrbColors('light');
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateOrbColors('dark');
        }
    });
    
    // Three.js Cosmic Orb
    let scene, camera, renderer, orb, orbMaterial, orbGlow;
    let mouseX = 0, mouseY = 0;
    
    function initThree() {
        // Scene setup
        scene = new THREE.Scene();
        
        // Camera setup
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        
        // Renderer setup
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth / 2, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('three-container').appendChild(renderer.domElement);
        
        // Orb creation
        const orbGeometry = new THREE.SphereGeometry(2, 64, 64);
        
        // Use current theme to determine initial colors
        const theme = htmlElement.getAttribute('data-theme');
        const color1 = theme === 'light' ? 0x6C63FF : 0x7B6CF9;
        const color2 = theme === 'light' ? 0xFF6584 : 0xFF7B9C;
        
        // Create shader material for the orb
        orbMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color(color1) },
                color2: { value: new THREE.Color(color2) },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                uniform float time;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    float noise = sin(vPosition.x * 5.0 + time) * sin(vPosition.y * 5.0 + time) * sin(vPosition.z * 5.0 + time);
                    vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
                    
                    // Add glow effect
                    float intensity = 1.05 - dot(vPosition, vec3(0.0, 0.0, 1.0));
                    vec3 glow = color * pow(intensity, 2.0);
                    
                    gl_FragColor = vec4(color + glow * 0.5, 1.0);
                }
            `
        });
        
        orb = new THREE.Mesh(orbGeometry, orbMaterial);
        scene.add(orb);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(2.2, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color(color1) },
                color2: { value: new THREE.Color(color2) },
                viewVector: { value: camera.position }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(0.9 - dot(vNormal, vNormel), 2.0);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                varying float intensity;
                void main() {
                    vec3 glow = mix(color1, color2, intensity * 0.5);
                    gl_FragColor = vec4(glow, intensity * 0.5);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        
        orbGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        scene.add(orbGlow);
        
        // Add particles around the orb
        addParticles();
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
        
        // Track mouse movement for interactive rotation
        document.addEventListener('mousemove', onMouseMove);
        
        // Start animation loop
        animate();
    }
    
    function addParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 1000;
        
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        const color1 = new THREE.Color(orbMaterial.uniforms.color1.value);
        const color2 = new THREE.Color(orbMaterial.uniforms.color2.value);
        
        for (let i = 0; i < particleCount; i++) {
            // Position particles in a sphere around the orb
            const radius = 2.5 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Mix colors
            const mixFactor = Math.random();
            colors[i * 3] = color1.r * (1 - mixFactor) + color2.r * mixFactor;
            colors[i * 3 + 1] = color1.g * (1 - mixFactor) + color2.g * mixFactor;
            colors[i * 3 + 2] = color1.b * (1 - mixFactor) + color2.b * mixFactor;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);
        
        // Animate particles
        gsap.to(particles.rotation, {
            y: Math.PI * 2,
            duration: 30,
            repeat: -1,
            ease: "none"
        });
    }
    
    function updateOrbColors(theme) {
        if (!orbMaterial || !orbGlow) return;
        
        const color1 = theme === 'light' ? new THREE.Color(0x6C63FF) : new THREE.Color(0x7B6CF9);
        const color2 = theme === 'light' ? new THREE.Color(0xFF6584) : new THREE.Color(0xFF7B9C);
        
        gsap.to(orbMaterial.uniforms.color1.value, {
            r: color1.r,
            g: color1.g,
            b: color1.b,
            duration: 1
        });
        
        gsap.to(orbMaterial.uniforms.color2.value, {
            r: color2.r,
            g: color2.g,
            b: color2.b,
            duration: 1
        });
        
        gsap.to(orbGlow.material.uniforms.color1.value, {
            r: color1.r,
            g: color1.g,
            b: color1.b,
            duration: 1
        });
        
        gsap.to(orbGlow.material.uniforms.color2.value, {
            r: color2.r,
            g: color2.g,
            b: color2.b,
            duration: 1
        });
    }
    
    function onWindowResize() {
        camera.aspect = window.innerWidth / 2 / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth / 2, window.innerHeight);
    }
    
    function onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    function animate() {
        requestAnimationFrame(animate);
        
        // Update orb rotation based on mouse position
        if (orb) {
            orb.rotation.y += 0.005;
            orb.rotation.x += 0.002;
            
            // Subtle movement based on mouse position
            orb.rotation.y += mouseX * 0.001;
            orb.rotation.x += mouseY * 0.001;
            
            // Update glow
            orbGlow.rotation.copy(orb.rotation);
            
            // Update shader time uniform
            orbMaterial.uniforms.time.value += 0.01;
        }
        
        renderer.render(scene, camera);
    }
    
    // Initialize Three.js scene
    initThree();
    
    // Voice Intro Functionality
    const voiceIntroBtn = document.getElementById('voice-intro-btn');
    let audioPlaying = false;
    let audio;
    
    voiceIntroBtn.addEventListener('click', function() {
        if (audioPlaying) {
            audio.pause();
            audio.currentTime = 0;
            voiceIntroBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Press to hear my story</span>';
            audioPlaying = false;
        } else {
            // Replace with your actual audio file
            audio = new Audio('voice-intro.mp3');
            
            // For demo purposes, we'll use the Web Speech API instead
            if ('speechSynthesis' in window) {
                const speech = new SpeechSynthesisUtterance();
                speech.text = "Welcome to my portfolio. I'm a civil engineer with a passion for digital innovation. My work bridges the gap between structural design and computational creativity, creating solutions that transform how we interact with the built environment.";
                speech.volume = 1;
                speech.rate = 0.9;
                speech.pitch = 1;
                
                speech.onstart = function() {
                    voiceIntroBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause narration</span>';
                    audioPlaying = true;
                };
                
                speech.onend = function() {
                    voiceIntroBtn.innerHTML = '<i class="fas fa-volume-up"></i><span>Press to hear my story</span>';
                    audioPlaying = false;
                };
                
                window.speechSynthesis.speak(speech);
            }
        }
    });
    
    // AR Experience Button
    const arBtn = document.getElementById('ar-btn');
    
    arBtn.addEventListener('click', function() {
        alert('AR experience would launch here. This would typically use WebXR or a similar technology to create an augmented reality experience of the portfolio.');
    });
    
    // Skill Tag Interaction
    const skillTags = document.querySelectorAll('.skill-tag');
    
    skillTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const skill = this.getAttribute('data-skill');
            
            // Animate the orb when a skill is clicked
            gsap.to(orb.scale, {
                x: 1.2,
                y: 1.2,
                z: 1.2,
                duration: 0.5,
                yoyo: true,
                repeat: 1,
                ease: "elastic.out(1, 0.3)"
            });
            
            // You could also trigger specific animations based on the skill
            console.log(`Skill clicked: ${skill}`);
        });
    });
    
    // Page entrance animation
    gsap.from('.content', {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.5
    });
    
    gsap.from('#three-container', {
        opacity: 0,
        scale: 0.8,
        duration: 1.2,
        delay: 0.3,
        ease: "back.out(1.7)"
    });
    
    gsap.from('.skill-tag', {
        opacity: 0,
        scale: 0,
        stagger: 0.1,
        duration: 0.8,
        delay: 1,
        ease: "back.out(1.7)"
    });
});
