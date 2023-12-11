const t = document.querySelector('#popuptext');
const s = localStorage.getItem('jasbot_success');
const l = localStorage.getItem('jasbot_last');
t.innerText = `${s} - ${t}`;
