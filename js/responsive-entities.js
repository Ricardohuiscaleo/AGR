function adjustEntitiesDisplay() {
  const isMobile = window.innerWidth <= 750;
  const entitiesToShow = isMobile ? 7 : 5;

  // Get all entities
  const entities = document.querySelectorAll('.entity-item'); // Adjust selector to match your HTML structure

  // Show or hide entities based on device
  entities.forEach((entity, index) => {
    if (index < entitiesToShow) {
      entity.style.display = 'block';
    } else {
      entity.style.display = 'none';
    }
  });
}

// Run on page load
document.addEventListener('DOMContentLoaded', adjustEntitiesDisplay);

// Run when window is resized
window.addEventListener('resize', adjustEntitiesDisplay);
