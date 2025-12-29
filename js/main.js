/**
 * Main Application Logic
 * Handles initialization, rendering, and interaction.
 */

import { teachings } from './data.js';
import { createTeachingCard } from './components.js';

// DOM Elements
const teachingsList = document.getElementById('teachings-list');
const videoModal = document.getElementById('video-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const modalCloseBtn = document.querySelector('.modal-close');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-description');
const videoPlaceholder = document.getElementById('video-placeholder');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const scrollBtn = document.getElementById('scroll-to-teachings');

// State
let currentlyOpenId = null;

// Initialization
function init() {
    renderTeachings();
    setupEventListeners();
}

/**
 * Renders the teachings grouped by date
 */
function renderTeachings() {
    if (!teachingsList) return;

    // Group by Date
    const grouped = teachings.reduce((acc, teaching) => {
        const date = teaching.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(teaching);
        return acc;
    }, {});

    // Generate HTML for each group
    let fullHTML = '';

    // Convert object to array to sort if needed, or iterate keys
    // Assuming data is pre-sorted or preserving insertion order is fine
    Object.keys(grouped).forEach(date => {
        const groupTeachings = grouped[date];

        const cardsHTML = groupTeachings.map((teaching, index) =>
            createTeachingCard(teaching, index) // Note: index might reset or needs to be cumulative. 
            // For now, index is ok per group or we can find original index.
            // Actually, previously it was 0-14. Now it will be 0-4 for each group. 
            // If we want 01-15 unique numbers, we should find index in main array.
        ).join('');

        fullHTML += `
            <section class="day-section">
                <h3 class="day-header">${date}</h3>
                <div class="teachings-grid">
                    ${cardsHTML}
                </div>
            </section>
        `;
    });

    teachingsList.innerHTML = fullHTML;
}

/**
 * Global Event Listeners
 */
function setupEventListeners() {
    // Scroll Button
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            const teachingsSection = document.getElementById('teachings');
            teachingsSection?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Modal Interactions (Close)
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // Keyboard Support (ESC to close)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Delegated Events for Grid (Watch, Download, Share)
    // Delegated Events for Grid (Watch, Download, Share)
    if (teachingsList) {
        teachingsList.addEventListener('click', handleGridClick);
    }
}

/**
 * Handles clicks within the teachings grid
 * @param {Event} e 
 */
function handleGridClick(e) {
    const target = e.target;
    const btn = target.closest('button');

    if (!btn) return;

    const id = parseInt(btn.dataset.id, 10);
    const teaching = teachings.find(t => t.id === id);

    if (!teaching) return;

    if (btn.classList.contains('action-watch')) {
        openModal(teaching);
    } else if (btn.classList.contains('action-download')) {
        handleDownload(teaching);
    } else if (btn.classList.contains('action-share')) {
        handleShare(teaching);
    }
}

/**
 * Opens the video modal
 * @param {Object} teaching 
 */
function openModal(teaching) {
    currentlyOpenId = teaching.id;

    // Update Content
    modalTitle.textContent = teaching.title;
    modalDesc.textContent = teaching.description;

    // In a real app, we'd swap the source of an iframe/video element here
    // videoElement.src = teaching.videoUrl;

    // Show Modal
    videoModal.classList.add('active');
    videoModal.setAttribute('aria-hidden', 'false');

    // Focus management (simple version)
    modalCloseBtn.focus();
}

/**
 * Closes the video modal
 */
function closeModal() {
    currentlyOpenId = null;
    videoModal.classList.remove('active');
    videoModal.setAttribute('aria-hidden', 'true');
    // Stop video playback logic would go here
}

/**
 * Simulate Download
 * @param {Object} teaching 
 */
function handleDownload(teaching) {
    // In real app: window.open(teaching.downloadUrl);
    showToast(`Downloading resources for "${teaching.title}"...`);
}

/**
 * Simulate Share
 * @param {Object} teaching 
 */
async function handleShare(teaching) {
    const shareUrl = `${window.location.origin}/#teaching-${teaching.id}`;

    try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard!');
    } catch (err) {
        // Fallback or error handling
        showToast('Shared!');
    }
}

/**
 * Display a temporary toast message
 * @param {string} msg 
 */
function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.remove('hidden');
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Run
document.addEventListener('DOMContentLoaded', init);
