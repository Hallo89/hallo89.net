//theme changer
function toggleMode() {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
}
//theme buttons dropdown
function toggleDropdown() {
  console.log('pressed');
  document.getElementById('mode_dropdown').classList.toggle('enabled');
  window.onclick = function(event) {
    if (!event.target.matches (
      [
        '.mode_gear',
        '.mode_gear_path',
        '.mode_switch'
      ]
    ))
    {
      document.getElementById('mode_dropdown').classList.remove('enabled');
    }
  }
}
