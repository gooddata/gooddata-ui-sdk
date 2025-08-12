document.addEventListener('DOMContentLoaded', function () {
    function createArchiveLink() {
        const link = document.createElement('a');
        link.className = 'dropdown-item';
        
        const currentHostname = window.location.hostname;
        if (currentHostname.includes('netlify.app')) {
            // For Netlify previews, link to the versions page within the current preview site
            link.href = window.location.origin + '/docs/gooddata-ui/versions/';
        } else if (currentHostname === 'localhost' || currentHostname === '127.0.0.1') {
            // For local testing, link to the versions page
            link.href = '/versions/';
        } else {
            // For production - link to the unversioned archive page
            link.href = 'https://www.gooddata.com/docs/gooddata-ui/versions/';
        }
        
        // Safe DOM manipulation - XSS protected
        const icon = document.createElement('i');
        icon.className = 'fas fa-archive me-2';
        icon.setAttribute('aria-hidden', 'true');
        
        link.appendChild(icon);
        link.appendChild(document.createTextNode('Archive'));
        
        // Add descriptive text for screen readers
        link.setAttribute('aria-label', 'View all versions in archive');
        
        return link;
    }
    
    // Select the dropdown menu and add the archive link
    const dropdownMenus = document.getElementsByClassName('dropdown-menu');
    for (let i = 0; i < dropdownMenus.length; i++) {
        const archiveLink = createArchiveLink();
        dropdownMenus[i].appendChild(archiveLink);
    }
});