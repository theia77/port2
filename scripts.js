// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
// Set initial theme based on preference or default to dark mode (data science)
const savedTheme = localStorage.getItem('sumoverse-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

text const themeSwitch = document.getElementById('theme-switch');
if (savedTheme === 'light') {
    themeSwitch.checked = true;
}

// Preloader
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
    }, 1500);
});

// Theme Toggle
themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('sumoverse-theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('sumoverse-theme', 'dark');
    }
    
    // Update 3D models and particles when theme changes
    updateModel();
    createBinaryCode();
    createParticles();
});

// Initialize Three.js scene
let scene, camera, renderer, mixer;
let dataScienceModel, civilEngineeringModel;
let clock = new THREE.Clock();
let mouseX = 0, mouseY = 0;

function initThreeJS() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    const canvas = document.getElementById('model-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Add point lights
    const pointLight1 = new THREE.PointLight(0x6C63FF, 1, 10);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00FFFF, 1, 10);
    pointLight2.position.set(-2, -2, 2);
    scene.add(pointLight2);
    
    // Create models
    createDataScienceModel();
    createCivilEngineeringModel();
    
    // Update visibility based on current theme
    updateModel();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        
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

function createDataScienceModel() {
    // Create a neural network visualization
    const group = new THREE.Group();
    
    // Create nodes
    const nodeCount = 20;
    const nodes = [];
    const nodeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    
    // Create different materials for nodes
    const nodeMaterial1 = new THREE.MeshPhongMaterial({
        color: 0x6C63FF,
        emissive: 0x6C63FF,
        emissiveIntensity: 0.5
    });
    
    const nodeMaterial2 = new THREE.MeshPhongMaterial({
        color: 0x00FFFF,
        emissive: 0x00FFFF,
        emissiveIntensity: 0.5
    });
    
    // Create nodes in a 3D space
    for (let i = 0; i < nodeCount; i++) {
        const material = i % 2 === 0 ? nodeMaterial1 : nodeMaterial2;
        const node = new THREE.Mesh(nodeGeometry, material);
        
        // Position nodes in a somewhat spherical arrangement
        const radius = 1.5;
        const phi = Math.acos(-1 + (2 * i) / nodeCount);
        const theta = Math.sqrt(nodeCount * Math.PI) * phi;
        
        node.position.x = radius * Math.cos(theta) * Math.sin(phi);
        node.position.y = radius * Math.sin(theta) * Math.sin(phi);
        node.position.z = radius * Math.cos(phi);
        
        // Add some random offset
        node.position.x += (Math.random() - 0.5) * 0.5;
        node.position.y += (Math.random() - 0.5) * 0.5;
        node.position.z += (Math.random() - 0.5) * 0.5;
        
        group.add(node);
        nodes.push(node);
    }
    
    // Create connections between nodes
    const connectionMaterial = new THREE.LineBasicMaterial({
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.3
    });
    
    for (let i = 0; i < nodeCount; i++) {
        // Connect to several other nodes
        for (let j = 0; j < 3; j++) {
            const targetIndex = (i + j + 1) % nodeCount;
            
            const points = [];
            points.push(nodes[i].position);
            points.push(nodes[targetIndex].position);
            
            const connectionGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(connectionGeometry, connectionMaterial);
            group.add(line);
        }
    }
    
    // Add central core
    const coreGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const coreMaterial = new THREE.MeshPhongMaterial({
        color: 0x6C63FF,
        emissive: 0x6C63FF,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.9
    });
    
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);
    
    dataScienceModel = group;
    scene.add(dataScienceModel);
}

function createCivilEngineeringModel() {
    // Create a bridge/building structure
    const group = new THREE.Group();
    
    // Base platform
    const baseGeometry = new THREE.BoxGeometry(3, 0.2, 1);
    const baseMaterial = new THREE.MeshPhongMaterial({
        color: 0x4682B4,
        emissive: 0x4682B4,
        emissiveIntensity: 0.2
    });
    
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1;
    group.add(base);
    
    // Pillars
    const pillarGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
    const pillarMaterial = new THREE.MeshPhongMaterial({
        color: 0xA9A9A9,
        emissive: 0xA9A9A9,
        emissiveIntensity: 0.1
    });
    
    const pillarPositions = [
        [-1.2, -0.25, 0.3],
        [-1.2, -0.25, -0.3],
        [1.2, -0.25, 0.3],
        [1.2, -0.25, -0.3]
    ];
    
    pillarPositions.forEach(pos => {
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillar.position.set(pos, pos, pos);
        group.add(pillar);
    });
    
    // Top structure
    const topGeometry = new THREE.BoxGeometry(3, 0.2, 1);
    const topMaterial = new THREE.MeshPhongMaterial({
        color: 0x4682B4,
        emissive: 0x4682B4,
        emissiveIntensity: 0.2
    });
    
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 0.5;
    group.add(top);
    
    // Add wireframe for blueprint look
    const wireframeGeometry = new THREE.BoxGeometry(3.1, 1.8, 1.1);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x4682B4,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    wireframe.position.y = -0.25;
    group.add(wireframe);
    
    // Add support beams
    const beamGeometry = new THREE.BoxGeometry(0.05, 0.05, 1);
    const beamMaterial = new THREE.MeshPhongMaterial({
        color: 0xA9A9A9
    });
    
    // Horizontal beams
    for (let i = 0; i < 5; i++) {
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.y = -0.8 + i * 0.3;
        beam.position.x = 0;
        group.add(beam);
    }
    
    // Diagonal supports
    const supportGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8);
    
    const diagonalPositions = [
        { pos: [-0.8, -0.25, 0.3], rot: [0, 0, Math.PI / 4] },
        { pos: [-0.8, -0.25, -0.3], rot: [0, 0, Math.PI / 4] },
        { pos: [0.8, -0.25, 0.3], rot: [0, 0, -Math.PI / 4] },
        { pos: [0.8, -0.25, -0.3], rot: [0, 0, -Math.PI / 4] }
    ];
    
    diagonalPositions.forEach(item => {
        const support = new THREE.Mesh(supportGeometry, beamMaterial);
        support.position.set(item.pos, item.pos, item.pos);
        support.rotation.set(item.rot, item.rot, item.rot);
        group.add(support);
    });
    
    civilEngineeringModel = group;
    scene.add(civilEngineeringModel);
}

function updateModel() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (dataScienceModel && civilEngineeringModel) {
        dataScienceModel.visible = currentTheme === 'dark';
        civilEngineeringModel.visible = currentTheme === 'light';
        
        // Update point light colors based on theme
        if (currentTheme === 'dark') {
            scene.children.color.setHex(0x6C63FF);
            scene.children.color.setHex(0x00FFFF);
        } else {
            scene.children.color.setHex(0x4682B4);
            scene.children.color.setHex(0xA9A9A9);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Rotate models based on mouse position
    if (dataScienceModel && dataScienceModel.visible) {
        dataScienceModel.rotation.y += 0.003;
        dataScienceModel.rotation.x += 0.001;
        
        // Mouse interaction
        dataScienceModel.rotation.y += (mouseX * 0.01 - dataScienceModel.rotation.y) * 0.05;
        dataScienceModel.rotation.x += (mouseY * 0.01 - dataScienceModel.rotation.x) * 0.05;
    }
    
    if (civilEngineeringModel && civilEngineeringModel.visible) {
        civilEngineeringModel.rotation.y += 0.001;
        
        // Mouse interaction
        civilEngineeringModel.rotation.y += (mouseX * 0.01 - civilEngineeringModel.rotation.y) * 0.05;
        civilEngineeringModel.rotation.x += (mouseY * 0.01 - civilEngineeringModel.rotation.x) * 0.05;
    }
    
    // Update animation mixer if exists
    if (mixer) mixer.update(delta);
    
    renderer.render(scene, camera);
}

// Initialize Three.js
initThreeJS();

// Create dynamic backgrounds
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    particlesContainer.innerHTML = ''; // Clear existing particles
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const particleCount = currentTheme === 'dark' ? 30 : 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 5 + 1;
        
        // Random opacity
        const opacity = Math.random() * 0.5 + 0.1;
        
        // Set styles
        particle.style.cssText = `
            position: absolute;
            top: ${y}%;
            left: ${x}%;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            opacity: ${opacity};
            transition: background-color var(--transition-speed) ease;
            background-color: ${currentTheme === 'dark' ? 
                (Math.random() > 0.5 ? '#6C63FF' : '#00FFFF') : 
                (Math.random() > 0.5 ? '#4682B4' : '#A9A9A9')};
        `;
        
        // Add to container
        particlesContainer.appendChild(particle);
        
        // Animate particle
        animateParticle(particle);
    }
}

function animateParticle(particle) {
    // Random duration
    const duration = Math.random() * 20 + 10;
    
    // Random direction
    const xMove = Math.random() * 20 - 10;
    const yMove = Math.random() * 20 - 10;
    
    // Set animation
    particle.animate([
        { transform: 'translate(0, 0)' },
        { transform: `translate(${xMove}px, ${yMove}px)` }
    ], {
        duration: duration * 1000,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out'
    });
}

function createBinaryCode() {
    const binaryContainer = document.querySelector('.binary');
    binaryContainer.innerHTML = ''; // Clear existing binary
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme !== 'dark') return; // Only show binary in dark mode
    
    // Create binary streams
    const streamCount = 15;
    
    for (let i = 0; i < streamCount; i++) {
        const stream = document.createElement('div');
        stream.classList.add('binary-stream');
        
        // Random position
        const x = Math.random() * 100;
        const delay = Math.random() * 5;
        
        // Generate binary text
        let binaryText = '';
        const length = Math.floor(Math.random() * 20) + 10;
        
        for (let j = 0; j < length; j++) {
            binaryText += Math.round(Math.random());
        }
        
        // Set styles
        stream.style.cssText = `
            position: absolute;
            top: -100px;
            left: ${x}%;
            color: #00FFFF;
            font-family: monospace;
            font-size: ${Math.random() * 10 + 10}px;
            opacity: ${Math.random() * 0.5 + 0.2};
            text-shadow: 0 0 5px #00FFFF;
            animation: binaryFall ${Math.random() * 10 + 5}s linear infinite;
            animation-delay: ${delay}s;
        `;
        
        stream.textContent = binaryText;
        binaryContainer.appendChild(stream);
    }
}

// Add binary fall animation to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes binaryFall {
        0% { transform: translateY(-100px); }
        100% { transform: translateY(calc(100vh + 100px)); }
    }
`;
document.head.appendChild(style);

// Initialize backgrounds
createParticles();
createBinaryCode();

// Initialize typing effect
const typedTextElement = document.getElementById('typed-text');

const options = {
    strings: [
        'Civil Engineer & Data Scientist',
        'Structural Design Specialist',
        'Machine Learning Engineer',
        'AutoCAD Expert & Python Developer',
        'Bridging Concrete and Code'
    ],
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 2000,
    loop: true,
    smartBackspace: true
};

const typed = new Typed(typedTextElement, options);

// AR Button functionality
const arButton = document.getElementById('ar-button');
arButton.addEventListener('click', () => {
    alert('AR feature coming soon! This will allow you to view the 3D models in augmented reality.');
});

// Enter button animation
const enterButton = document.querySelector('.enter-btn');
enterButton.addEventListener('mouseenter', () => {
    gsap.to(enterButton, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
    });
});

enterButton.addEventListener('mouseleave', () => {
    gsap.to(enterButton, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
    });
});

enterButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Add exit animation
    gsap.to('.container', {
        opacity: 0,
        y: -50,
        duration: 0.8,
        ease: 'power2.inOut'
    });
    
    gsap.to('.background', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
            // Navigate to main page
            window.location.href = 'mainpage.html';
        }
    });
});
