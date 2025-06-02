// YouTube API configuration
const API_KEY = 'AIzaSyDnglKX4aBKsP4spGnLzA8Wyz024JV8dpU'; // You'll need to replace this with your actual YouTube API key

// Video IDs from your embedded videos
const videoIds = [
    'j3CWxxfGII8',
    'hv3iCYFJBwo',
    'Uv5sEXwIkuE',
    'N3U0JEzEoDM',
    'XhiyZTUb5Zk',
    'Dh97FMd1qVo'
];

// Function to format duration from ISO 8601 format
function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    let formatted = '';
    if (hours) formatted += `${hours}:`;
    formatted += `${minutes.padStart(2, '0')}:`;
    formatted += seconds.padStart(2, '0');

    return formatted;
}

// Function to fetch video details
async function fetchVideoDetails() {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(',')}&key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch video details');
        }

        const data = await response.json();

        // Process each video and update the DOM
        data.items.forEach(video => {
            const videoCard = document.querySelector(`[data-video-id="${video.id}"]`);
            if (videoCard) {
                // Update title
                const titleElement = videoCard.querySelector('.video-info h3');
                if (titleElement) {
                    titleElement.textContent = video.snippet.title;
                }

                // Update description
                const descElement = videoCard.querySelector('.video-info p');
                if (descElement) {
                    descElement.textContent = video.snippet.description.split('\n')[0]; // First line of description
                }

                // Add duration
                const metaElement = videoCard.querySelector('.video-meta');
                if (metaElement) {
                    const duration = formatDuration(video.contentDetails.duration);
                    const durationSpan = document.createElement('span');
                    durationSpan.innerHTML = `<i class="fas fa-clock"></i> ${duration}`;
                    durationSpan.classList.add('video-duration');
                    metaElement.insertBefore(durationSpan, metaElement.firstChild);
                }

                // Add view count
                const viewCount = parseInt(video.statistics.viewCount).toLocaleString();
                const viewsSpan = document.createElement('span');
                viewsSpan.innerHTML = `<i class="fas fa-eye"></i> ${viewCount} views`;
                viewsSpan.classList.add('video-views');
                metaElement.insertBefore(viewsSpan, metaElement.firstChild);
            }
        });
    } catch (error) {
        console.error('Error fetching video details:', error);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', fetchVideoDetails); 