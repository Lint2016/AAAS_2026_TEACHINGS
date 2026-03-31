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
    return `
        <article class="teaching-card" data-id="${teaching.id}">
            <div class="card-content">
                <h3 class="card-title">${teaching.title}</h3>
                <p class="card-description">${teaching.description}</p>
                <div class="card-meta">
                    <span class="meta-label">Audio</span> <span class="meta-divider">•</span> <span>${teaching.duration}</span>
                </div>
            </div>
            
            <div class="card-actions">
                <div class="action-group-left">
                    <!-- Video functionally disabled
                    ${teaching.videoUrl && teaching.videoUrl !== "" ? `
                    <button class="btn btn-primary action-watch" data-id="${teaching.id}" aria-label="Watch ${teaching.title}">
                        <i class="ph ph-play-circle"></i> Watch
                    </button>
                    ` : ''}
                    -->
                    ${teaching.audioUrl && teaching.audioUrl !== "" ? `
                    <button class="btn btn-secondary action-listen" data-id="${teaching.id}" aria-label="Listen to ${teaching.title}">
                        <i class="ph ph-headphones"></i> Listen
                    </button>
                    ` : ''}
                </div>
                
                <div class="action-group-right">
                    <button class="btn btn-icon-only action-download" data-id="${teaching.id}" aria-label="Download materials for ${teaching.title}">
                        <i class="ph ph-download-simple"></i>
                    </button>
                </div>
            </div>
        </article>
    `;
}
