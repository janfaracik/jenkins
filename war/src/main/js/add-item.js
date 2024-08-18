const tasks = document.querySelectorAll(".task");
const dinnerbins = document.querySelectorAll(".dinnerbin");

tasks.forEach((task, index) => {
  task.addEventListener('click', () => {
    tasks.forEach(asd =>
      asd.querySelector('.task-link').classList.remove('task-link--active'));
    dinnerbins.forEach(dinnerbin => dinnerbin.style.display = 'none');

    dinnerbins[index].style.display = 'block';
    task.querySelector('.task-link').classList.add('task-link--active');
  })
})

tasks[0].click();
