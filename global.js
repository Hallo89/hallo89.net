//theme changer
function toggleMode() {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
}
//theme buttons dropdown
function toggleDropdown() {
    document.getElementById('mode_dropdown').classList.toggle('enabled');
}
window.onclick = function(event) {
  if (!event.target.matches (
    [
      '.fa-cog',
      '.mode_switch',
      '.mode_dropdown_box'
    ]
  ))
  {
    if (document.getElementById('mode_dropdown').classList.contains('enabled')) {
      document.getElementById('mode_dropdown').classList.remove('enabled');
    }
  }
}
