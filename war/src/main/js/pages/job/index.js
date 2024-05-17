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

document.querySelectorAll('[data-initial-time]').forEach(element => {
  const locale = document.querySelector('html').dataset.locale;
  const template = element.getAttribute('data-time-template');
  const startTime = new Date(Number(element.getAttribute('data-initial-time')));

  const formatElapsedTime = (time, unit) => {
    return Intl.NumberFormat(locale, {
      style: "unit",
      unit: unit,
      unitDisplay: "short"
    }).format(time);
  };

  function updateElapsedTime() {
    const now = new Date();
    const elapsed = now - startTime;
    const seconds = Math.floor((elapsed / 1000) % 60);
    const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
    const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
    const days = Math.floor((elapsed / (1000 * 60 * 60 * 24)) % 30);
    const months = Math.floor((elapsed / (1000 * 60 * 60 * 24 * 30)) % 12);
    const years = Math.floor(elapsed / (1000 * 60 * 60 * 24 * 365));

    let elapsedTimeString = '';
    if (years > 0) {
      elapsedTimeString += formatElapsedTime(years, 'year') + ' ';
    }
    if (months > 0) {
      elapsedTimeString += formatElapsedTime(months, 'month') + ' ';
    }
    if (days > 0) {
      elapsedTimeString += formatElapsedTime(days, 'day') + ' ';
    }
    if (hours > 0 && days < 10 && months === 0 && years === 0) {
      elapsedTimeString += formatElapsedTime(hours, 'hour') + ' ';
    }
    if (minutes > 0 && days === 0) {
      elapsedTimeString += formatElapsedTime(minutes, 'minute') + ' ';
    }
    if (hours === 0 && minutes < 10) {
      elapsedTimeString += formatElapsedTime(seconds, 'second');
    }

    element.textContent = template.replace("####", elapsedTimeString);
  }

  updateElapsedTime();
  setInterval(updateElapsedTime, 1000);
})
