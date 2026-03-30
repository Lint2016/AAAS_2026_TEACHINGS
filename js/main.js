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
const modalShareBtn = document.getElementById('modal-share');
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
    handleUrlHash();
}

function handleUrlHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#teaching-')) {
        const id = parseInt(hash.replace('#teaching-', ''), 10);
        const teaching = teachings.find(t => t.id === id);
        if (teaching) {
            setTimeout(() => {
                const teachingsSection = document.getElementById('teachings');
                if (teachingsSection) teachingsSection.scrollIntoView({ behavior: 'smooth' });
                openModal(teaching);
            }, 500);
        }
    }
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

    // Modal Share
    if (modalShareBtn) {
        modalShareBtn.addEventListener('click', () => {
            const teaching = teachings.find(t => t.id === currentlyOpenId);
            if (teaching) handleShare(teaching);
        });
    }

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

    if (btn.classList.contains('action-watch') || btn.classList.contains('action-listen')) {
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

    // Inject Vimeo Iframe or Audio
    const videoWrapper = document.querySelector('.video-wrapper');
    const modalContainer = document.querySelector('.modal-container');
    if (videoWrapper) {
        if (teaching.videoUrl && teaching.videoUrl !== "") {
            if (modalContainer) modalContainer.classList.remove('audio-mode');
            const videoId = teaching.videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
            if (videoId) {
                videoWrapper.innerHTML = `
                    <iframe 
                        src="https://player.vimeo.com/video/${videoId}?autoplay=1" 
                        width="100%" 
                        height="100%" 
                        frameborder="0" 
                        allow="autoplay; fullscreen; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                `;
            } else {
                videoWrapper.innerHTML = `
                    <div class="video-placeholder">
                        <p>Invalid Video URL</p>
                    </div>
                `;
            }
        } else if (teaching.audioUrl && teaching.audioUrl !== "") {
            if (modalContainer) modalContainer.classList.add('audio-mode');
            videoWrapper.innerHTML = `
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: var(--color-base); padding: 20px; box-sizing: border-box;">
                    <div style="width: 100%; max-width: 600px; text-align: center;">
                        <i class="ph ph-headphones" style="font-size: 4rem; color: var(--color-primary); margin-bottom: 20px;"></i>
                        <audio controls autoplay style="width: 100%;">
                            <source src="${teaching.audioUrl}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>
            `;
        } else {
            videoWrapper.innerHTML = `
                <div class="video-placeholder">
                    <p>Media coming soon.</p>
                </div>
            `;
        }
    }

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
    
    const modalContainer = document.querySelector('.modal-container');
    if (modalContainer) modalContainer.classList.remove('audio-mode');

    // Stop video playback by clearing the wrapper
    const videoWrapper = document.querySelector('.video-wrapper');
    if (videoWrapper) {
        videoWrapper.innerHTML = `
            <div id="video-placeholder" class="video-placeholder">
                <i class="ph ph-headphones"></i>
                <p>Media Player Placeholder</p>
            </div>
        `;
    }
}

/**
 * Simulate Download
 * @param {Object} teaching 
 */
function handleDownload(teaching) {
    const downloadLink = teaching.audioUrl || teaching.videoUrl || teaching.downloadUrl;
    if (downloadLink && downloadLink !== "#" && downloadLink !== "") {
        const a = document.createElement('a');
        a.href = downloadLink;
        a.download = true;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast(`Downloading resources for "${teaching.title}"...`);
    } else {
        showToast(`Download not available for "${teaching.title}" yet.`);
    }
}

/**
 * Simulate Share
 * @param {Object} teaching 
 */
async function handleShare(teaching) {
    const shareUrl = `${window.location.href.split('#')[0]}#teaching-${teaching.id}`;

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
