//theme changer
function toggleMode() {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
}
//expand/hide the headline
function toggleHeadline() {
  document.body.classList.toggle('headline_expanded');
}
//theme buttons dropdown
function toggleDropdown() {
  document.getElementById('modes').classList.toggle('enabled');
  window.onclick = function(event) {
    if (!event.target.matches (
      [
        '.mode_gear',
        '.mode_gear_path',
        '.mode_dropdown',
        '.mode_switch'
      ]
    ))
    {
      if (document.getElementById('modes').classList.contains('enabled')) {
        document.getElementById('modes').classList.remove('enabled');
      }
    }
  }
}
