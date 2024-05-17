document.getElementById('flipButton').addEventListener('click', function() {
  const flipper = document.querySelector('.flipper');
  const front = document.querySelector('.front');
  const back = document.querySelector('.back');

  if (flipper.classList.contains('flip')) {
    // Currently showing back, flip to front
    flipper.classList.remove('flip');
    front.setAttribute('aria-hidden', 'false');
    back.setAttribute('aria-hidden', 'true');
  } else {
    // Currently showing front, flip to back
    flipper.classList.add('flip');
    front.setAttribute('aria-hidden', 'true');
    back.setAttribute('aria-hidden', 'false');
  }
});
