/**
 * Component Generator
 * Pure functions to return HTML strings.
 */

/**
 * Creates the HTML string for a single teaching card.
 * @param {Object} teaching - The teaching data object
 * @param {number} index - The index of the item (for numbering)
 * @returns {string} HTML string
 */
export function createTeachingCard(teaching, index) {
    // Pad the number with a leading zero if needed (e.g., 01, 02)
    const displayNum = (index + 1).toString().padStart(2, '0');

    return `
        <article class="teaching-card" data-id="${teaching.id}">
            <span class="card-number">${displayNum}</span>
            <div class="card-content">
                <h3 class="card-title">${teaching.title}</h3>
                <p class="card-description">${teaching.description}</p>
                <div class="card-meta" style="margin-bottom: 1rem; font-size: 0.8rem; color: var(--color-text-muted);">
                    <span>${teaching.presenter}</span> • <span>${teaching.duration}</span>
                </div>
            </div>
            
            <div class="card-actions">
                <button class="btn btn-outline btn-sm action-watch" data-id="${teaching.id}" aria-label="Watch ${teaching.title}">
                    <i class="ph ph-play"></i> Watch
                </button>
                
                <div class="action-group-right">
                    <button class="btn btn-icon-only action-download" data-id="${teaching.id}" aria-label="Download materials for ${teaching.title}">
                        <i class="ph ph-download-simple"></i>
                    </button>
                    <button class="btn btn-icon-only action-share" data-id="${teaching.id}" aria-label="Share ${teaching.title}">
                        <i class="ph ph-share-network"></i>
                    </button>
                </div>
            </div>
        </article>
    `;
}
