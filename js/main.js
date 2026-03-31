/**
 * Main Application Logic
 * Handles initialization, rendering, and interaction.
 */

import { teachings } from './data.js';
import { createTeachingCard } from './components.js';
import { db, collection, query, where, getDocs } from './firebase-config.js';

// DOM Elements
const teachingsList = document.getElementById('teachings-list');
const teachingsSection = document.getElementById('teachings');
const videoModal = document.getElementById('video-modal');
const modalOverlay = document.querySelector('#video-modal .modal-overlay');
const modalCloseBtn = document.querySelector('#video-modal .modal-close');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-description');
const videoPlaceholder = document.getElementById('video-placeholder');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const accessBtn = document.getElementById('access-teachings-btn');
const scrollBtn = document.getElementById('scroll-to-teachings');
const logoutBtn = document.getElementById('logout-btn');

// Auth DOM Elements
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('reg-email');
const authError = document.getElementById('auth-error');
const authCancelBtn = document.getElementById('auth-cancel');
const authOverlay = document.querySelector('#auth-modal .modal-overlay');
const authSubmitBtn = document.getElementById('auth-submit');
const authSpinner = authSubmitBtn?.querySelector('.spinner');
const authBtnText = authSubmitBtn?.querySelector('.btn-text');

// State
let currentlyOpenId = null;
let isAuthenticated = false;

// Initialization
function init() {
    checkSession();
    renderTeachings();
    setupEventListeners();
    handleUrlHash();
}

function checkSession() {
    const sessionCookie = localStorage.getItem('aaas_session');
    if (sessionCookie === 'true') {
        grantAccess(false);
    }
}

function handleUrlHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#teaching-')) {
        const id = parseInt(hash.replace('#teaching-', ''), 10);
        const teaching = teachings.find(t => t.id === id);
        
        if (teaching) {
            setTimeout(() => {
                if (!isAuthenticated) {
                    showAuthModal();
                } else {
                    if (teachingsSection) teachingsSection.scrollIntoView({ behavior: 'smooth' });
                    openModal(teaching);
                }
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

    let fullHTML = '';

    Object.keys(grouped).forEach(date => {
        const groupTeachings = grouped[date];

        const morningGroup = groupTeachings.filter(t => t.description && t.description.toLowerCase().includes('morning'));
        const eveningGroup = groupTeachings.filter(t => t.description && t.description.toLowerCase().includes('evening'));
        const otherGroup = groupTeachings.filter(t => !t.description || (!t.description.toLowerCase().includes('morning') && !t.description.toLowerCase().includes('evening')));

        let sectionHTML = `
            <section class="day-section">
                <h3 class="day-header">${date}</h3>
        `;
        
        if (morningGroup.length > 0) {
            sectionHTML += `
                <h4 class="session-header"><i class="ph ph-sun"></i> Morning Sessions</h4>
                <div class="teachings-grid">
                    ${morningGroup.map(teaching => createTeachingCard(teaching)).join('')}
                </div>
            `;
        }
        
        if (eveningGroup.length > 0) {
            sectionHTML += `
                <h4 class="session-header evening-spacing"><i class="ph ph-moon"></i> Evening Sessions</h4>
                <div class="teachings-grid">
                    ${eveningGroup.map(teaching => createTeachingCard(teaching)).join('')}
                </div>
            `;
        }
        
        if (otherGroup.length > 0) {
            sectionHTML += `
                <h4 class="session-header evening-spacing">Special Sessions</h4>
                <div class="teachings-grid">
                    ${otherGroup.map(teaching => createTeachingCard(teaching)).join('')}
                </div>
            `;
        }
        
        sectionHTML += `</section>`;
        fullHTML += sectionHTML;
    });

    teachingsList.innerHTML = fullHTML;
}

/**
 * Global Event Listeners
 */
function setupEventListeners() {
    // Access Controls
    if (accessBtn) accessBtn.addEventListener('click', showAuthModal);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (scrollBtn) scrollBtn.addEventListener('click', () => {
        teachingsSection?.scrollIntoView({ behavior: 'smooth' });
    });

    // Auth Modal Interactions
    if (authCancelBtn) authCancelBtn.addEventListener('click', closeAuthModal);
    if (authOverlay) authOverlay.addEventListener('click', closeAuthModal);
    if (authForm) authForm.addEventListener('submit', handleAuthSubmit);

    // Video Modal Interactions (Close)
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // Keyboard Support (ESC to close)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (videoModal && videoModal.classList.contains('active')) closeModal();
            if (authModal && authModal.classList.contains('active')) closeAuthModal();
        }
    });

    // Delegated Events for Grid (Watch, Download, Share)
    if (teachingsList) {
        teachingsList.addEventListener('click', handleGridClick);
    }
}

/**
 * Authentication Flow
 */
function showAuthModal() {
    authModal.classList.add('active');
    authModal.setAttribute('aria-hidden', 'false');
    authError.classList.add('hidden');
    emailInput.value = '';
    emailInput.focus();
}

function closeAuthModal() {
    authModal.classList.remove('active');
    authModal.setAttribute('aria-hidden', 'true');
    authError.classList.add('hidden');
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();
    if (!email) return;

    // Show Loading View
    authBtnText.textContent = 'Verifying...';
    authSpinner.classList.remove('hidden');
    authSubmitBtn.disabled = true;
    authError.classList.add('hidden');

    try {
        const q = query(collection(db, "registrations"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Found
            closeAuthModal();
            grantAccess(true);
            showToast('Verification successful! Welcome.');
        } else {
            // Not Found
            authError.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Firebase lookup error:", error);
        authError.classList.remove('hidden');
        authError.querySelector('span').textContent = 'An error occurred checking our records. Please try again.';
    } finally {
        authBtnText.textContent = 'Verify Access';
        authSpinner.classList.add('hidden');
        authSubmitBtn.disabled = false;
    }
}

function grantAccess(shouldScroll = true) {
    isAuthenticated = true;
    localStorage.setItem('aaas_session', 'true');
    
    teachingsSection.classList.remove('hidden');
    accessBtn.classList.add('hidden');
    scrollBtn.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');

    if (shouldScroll) {
        setTimeout(() => {
            teachingsSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

function logout() {
    isAuthenticated = false;
    localStorage.removeItem('aaas_session');
    
    teachingsSection.classList.add('hidden');
    accessBtn.classList.remove('hidden');
    scrollBtn.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('You have been securely logged out.');
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

    // Update URL Hash without jumping
    history.replaceState(null, null, `#teaching-${teaching.id}`);

    // Inject Vimeo Iframe or Audio
    const videoWrapper = document.querySelector('.video-wrapper');
    const modalContainer = document.querySelector('.modal-container');
    if (videoWrapper) {
        
        // --- Video Functionality Disabled ---
        // if (teaching.videoUrl && teaching.videoUrl !== "") {
        //     if (modalContainer) modalContainer.classList.remove('audio-mode');
        //     const videoId = teaching.videoUrl.match(/vimeo\\.com\\/(\\d+)/)?.[1];
        //     videoWrapper.innerHTML = '<video controls autoplay><source src="' + teaching.videoUrl + '" type="video/mp4"></video>';
        // } else 

        if (teaching.audioUrl && teaching.audioUrl !== "") {
            if (modalContainer) modalContainer.classList.add('audio-mode');
            videoWrapper.innerHTML = `
                <div class="audio-player-container">
                    <div class="audio-controls-wrapper">
                        <audio controls autoplay class="audio-player">
                            <source src="${teaching.audioUrl}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                    ${teaching.imageUrl ? `
                    <div class="speaker-image-wrapper">
                        <img src="${teaching.imageUrl}" alt="${teaching.title}" class="audio-speaker-img">
                    </div>` : `
                    <div class="speaker-image-wrapper placeholder-wrapper">
                        <i class="ph ph-headphones audio-icon"></i>
                    </div>`}
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
    
    setTimeout(() => {
        modalCloseBtn?.focus();
    }, 100);
}

/**
 * Closes the video modal
 */
function closeModal() {
    currentlyOpenId = null;
    videoModal.classList.remove('active');
    videoModal.setAttribute('aria-hidden', 'true');
    
    history.replaceState(null, null, window.location.pathname + window.location.search);

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
 * Display a temporary toast message
 * @param {string} msg 
 */
function showToast(msg) {
    toastMessage.textContent = msg;
    toast.classList.remove('hidden');
    
    if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
        clearTimeout(window.toastFadeTimeout);
    }
    
    toast.style.opacity = '1';

    window.toastFadeTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        window.toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Run
document.addEventListener('DOMContentLoaded', init);
