const GITHUB_USERNAME = 'HariomRajChauhan';
const DISPLAY_COUNT = 6; // Number of projects to display
const ROTATION_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

// Function to get random items from array
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Function to check if we need to update the cached projects
function shouldUpdateCache() {
    const lastUpdate = localStorage.getItem('lastProjectUpdate');
    if (!lastUpdate) return true;

    const timeDiff = Date.now() - parseInt(lastUpdate);
    return timeDiff >= ROTATION_INTERVAL;
}

// Function to get cached projects or generate new ones
function getDisplayProjects(allProjects) {
    const currentTime = Date.now();
    const cachedData = localStorage.getItem('displayProjects');

    if (cachedData && !shouldUpdateCache()) {
        return JSON.parse(cachedData);
    }

    // Get new random projects
    const newProjects = getRandomItems(allProjects, DISPLAY_COUNT);

    // Cache the new selection with timestamp
    localStorage.setItem('displayProjects', JSON.stringify(newProjects));
    localStorage.setItem('lastProjectUpdate', currentTime.toString());

    return newProjects;
}

// Function to determine project thumbnail based on languages and name
function getProjectThumbnail(project, languages) {
    const languagesList = Object.keys(languages);
    const projectName = project.name.toLowerCase();

    // Default gradients for different types of projects
    const thumbnails = {
        react: 'linear-gradient(135deg, #61dafb30, #282c34)',
        vue: 'linear-gradient(135deg, #42b88330, #34495e)',
        angular: 'linear-gradient(135deg, #dd003330, #1976d2)',
        node: 'linear-gradient(135deg, #3c873a30, #303030)',
        python: 'linear-gradient(135deg, #30699830, #FFE873)',
        java: 'linear-gradient(135deg, #b0711530, #f89820)',
        web: 'linear-gradient(135deg, #2196f330, #1976d2)',
        default: 'linear-gradient(135deg, #1a237e, #0d47a1)'
    };

    // Check project type based on languages and name
    if (languagesList.includes('TypeScript') || languagesList.includes('JavaScript')) {
        if (projectName.includes('react')) return thumbnails.react;
        if (projectName.includes('vue')) return thumbnails.vue;
        if (projectName.includes('angular')) return thumbnails.angular;
        if (projectName.includes('node')) return thumbnails.node;
        return thumbnails.web;
    }
    if (languagesList.includes('Python')) return thumbnails.python;
    if (languagesList.includes('Java')) return thumbnails.java;

    return thumbnails.default;
}

// Function to get appropriate icon based on project type
function getProjectIcon(project, languages) {
    const languagesList = Object.keys(languages);
    const projectName = project.name.toLowerCase();

    if (projectName.includes('react')) return 'fab fa-react';
    if (projectName.includes('vue')) return 'fab fa-vuejs';
    if (projectName.includes('angular')) return 'fab fa-angular';
    if (projectName.includes('node')) return 'fab fa-node-js';
    if (languagesList.includes('Python')) return 'fab fa-python';
    if (languagesList.includes('Java')) return 'fab fa-java';
    if (languagesList.includes('HTML') || projectName.includes('web')) return 'fas fa-globe';

    return 'fas fa-code';
}

// Function to properly capitalize project name
function capitalizeProjectName(name) {
    // Split by hyphens, underscores, or spaces
    return name
        .split(/[-_\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

async function fetchGitHubProjects() {
    try {
        // First try to fetch all pages of repositories
        let allProjects = [];
        let page = 1;

        while (true) {
            const response = await fetch(
                `https://api.github.com/users/${GITHUB_USERNAME}/repos?page=${page}&per_page=100`
            );
            const projects = await response.json();

            if (!Array.isArray(projects) || projects.length === 0) {
                break;
            }

            allProjects = [...allProjects, ...projects.filter(project => !project.fork)];
            page++;
        }

        if (allProjects.length === 0) {
            throw new Error('No projects found');
        }

        // Get the projects to display
        const displayProjects = getDisplayProjects(allProjects);

        const projectsContainer = document.querySelector('.Projects');
        projectsContainer.innerHTML = ''; // Clear existing projects

        // Display the selected projects
        for (const project of displayProjects) {
            // Fetch languages used in the project
            const languagesResponse = await fetch(project.languages_url);
            const languages = await languagesResponse.json();
            const languagesList = Object.keys(languages).slice(0, 3); // Get top 3 languages

            // Get project thumbnail and icon
            const thumbnail = getProjectThumbnail(project, languages);
            const icon = getProjectIcon(project, languages);

            // Create project card
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-aos', 'fade-up');

            card.innerHTML = `
                <div class="card-image" style="background: ${thumbnail}">
                    <div class="project-icon">
                        <i class="${icon}"></i>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${capitalizeProjectName(project.name)}</h3>
                    <p class="paragraphDec">${project.description || 'No description available'}</p>
                    <div class="project-tech-stack">
                        ${languagesList.map(lang => `<span class="tech-tag">${lang}</span>`).join('')}
                    </div>
                    <div class="project-links">
                        <a href="${project.html_url}" target="_blank" class="project-link">
                            <i class="fab fa-github"></i> Code
                        </a>
                        ${project.homepage ? `
                            <a href="${project.homepage}" target="_blank" class="project-link">
                                <i class="fas fa-external-link-alt"></i> Live Demo
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;

            projectsContainer.appendChild(card);
        }

        // Schedule next update
        const timeUntilNextUpdate = ROTATION_INTERVAL - (Date.now() - parseInt(localStorage.getItem('lastProjectUpdate')));
        setTimeout(() => {
            fetchGitHubProjects();
        }, timeUntilNextUpdate);

    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        document.querySelector('.Projects').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load projects. Please try again later.</p>
            </div>
        `;
    }
}

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', fetchGitHubProjects);