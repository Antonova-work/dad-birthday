// Список музеев на выбор
const museums = [
     {
    id: 'm1',
    title: 'Музей СССР',
    desc: 'Ты уже настолько старый, что тебя могут перепутать с экспонатом.',
    img: '/sources/museums/ussr.png',
    recommended: true
  },
  {
    id: 'm2',
    title: 'Автомузей «Автомобили Мира»',
    desc: 'Давай короче я отвлекаю, а ты залезаешь в машину и...',
    img: '/sources/museums/automoseum.png',
    recommended: true
  },
  {
    id: 'm3',
    title: 'Музей криптографии',
    desc: 'Вживую может даже потыкать Энигму дадут. А если не дадут можно отобрать и всё равно потыкать.',
    img: '/sources/museums/cryptography.png',
    recommended: true
  },
  {
    id: 'm4',
    title: 'Музей Космонавтики',
    desc: 'В музее есть настоящий скафандр для собаки. Даже у собаки есть скафандр, а у тебя нет. А часики тикают...',
    img: '/sources/museums/kosmonavtiki.png',
    recommended: false
  },
  {
    id: 'm5',
    title: 'Третьяковская Галерея',
    desc: 'Потренируйся заранее делать очень умное лицо. А то мне стыдно будет.',
    img: '/sources/museums/tretiakovskaya.png',
    recommended: false
  },
  {
    id: 'm6',
    title: 'Палеонтологический музей',
    desc: 'А когда ты был маленький у тебя жил такой дома?',
    img: '/sources/museums/paleontological.png',
    recommended: false
  },
 
];

// Данные членов семьи
const companions = [
  { id: 'c1', name: 'Света', img: '/sources/mama.png' },
  { id: 'c2', name: 'Андрей', img: '/sources/andrey.png' },
  { id: 'c3', name: 'Настя', img: '/sources/nastya.png' }
];

// Текущее состояние выбора
let state = {
  selectedMuseum: null,
  selectedCompanions: [],
  selectedDate: null
};

// ANIMATIONS & NAVIGATION

let confettiInterval;

function startConfettiLoop() {
  confettiInterval = setInterval(() => {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  }, 1500);
}

function stopConfettiLoop() {
  clearInterval(confettiInterval);
}

startConfettiLoop();

function goToStep(stepNumber) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const targetScreen = document.getElementById(`step-${stepNumber}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  if (stepNumber !== 0) {
    stopConfettiLoop();
  }
}

document.getElementById('startBtn').addEventListener('click', () => {
  goToStep(1);
});

// LOCALSTORAGE HELPERS

function getVisitedFromStorage() {
  const data = localStorage.getItem('my_visited_museums');
  return data ? JSON.parse(data) : [];
}

function saveCurrentMuseumToVisited() {
  if (!state.selectedMuseum) return;

  const currentVisited = getVisitedFromStorage();
  const exists = currentVisited.some(item => item.id === state.selectedMuseum.id);
  
  if (!exists) {
    const newEntry = {
      id: state.selectedMuseum.id,
      title: state.selectedMuseum.title,
      img: state.selectedMuseum.img,
      date: state.selectedDate,
      rating: 0
    };
    currentVisited.push(newEntry);
    localStorage.setItem('my_visited_museums', JSON.stringify(currentVisited));
  }
}

// 1: MUSEUMS & RATING DIARY

function renderMuseums() {
  const container = document.getElementById('museumGrid');
  if (!container) return;
  container.innerHTML = '';

  // Фильтруем список: убираем музеи, которые уже есть в посещенных
  const visitedList = getVisitedFromStorage();
  const availableMuseums = museums.filter(m => !visitedList.some(v => v.id === m.id));

  // Если все музеи уже ушли в посещенные
  if (availableMuseums.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; padding: 20px; background: rgba(255,255,255,0.6); border-radius: 12px;">
        <h3>Димочка-умничка сходил по всем музеям! 🏆</h3>
        <p>Смотри список и оценки ниже.</p>
      </div>
    `;
    document.getElementById('toStep2Btn').disabled = true;
    return;
  }

  availableMuseums.forEach(m => {
    const card = document.createElement('div');
    card.className = `card ${state.selectedMuseum?.id === m.id ? 'selected' : ''}`;
    
    card.innerHTML = `
      ${m.recommended ? '<div class="badge">⭐ Личная рекомендация</div>' : ''}
      <img src="${m.img}" alt="${m.title}">
      <h3>${m.title}</h3>
      <p>${m.desc}</p>
    `;

    card.onclick = () => {
      state.selectedMuseum = m;
      renderMuseums();
      document.getElementById('toStep2Btn').disabled = false;
    };

    container.appendChild(card);
  });
}

document.getElementById('toStep2Btn').addEventListener('click', () => goToStep(2));

function renderVisitedMuseums() {
  const container = document.getElementById('visitedGrid');
  if (!container) return;
  
  const visitedList = getVisitedFromStorage();
  container.innerHTML = '';

  if (visitedList.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; opacity: 0.6;">Тут пусто. Выйди потрогай траву 🌱</p>`;
    return;
  }

  visitedList.forEach(m => {
    const card = document.createElement('div');
    card.className = 'visited-card';
    card.innerHTML = `
      <img src="${m.img}" alt="${m.title}">
      <h4>${m.title}</h4>
      <p style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 5px;">Дата: ${m.date}</p>
      <div class="stars" data-id="${m.id}">
        ${[1, 2, 3, 4, 5].map(star => `
          <span data-star="${star}">${star <= m.rating ? '★' : '☆'}</span>
        `).join('')}
      </div>
    `;

    const starsContainer = card.querySelector('.stars');
    starsContainer.addEventListener('click', (e) => {
      if (e.target.dataset.star) {
        const starValue = parseInt(e.target.dataset.star);
        m.rating = starValue;
        
        const allVisited = getVisitedFromStorage();
        const updated = allVisited.map(item => item.id === m.id ? { ...item, rating: starValue } : item);
        localStorage.setItem('my_visited_museums', JSON.stringify(updated));
        
        renderVisitedMuseums();
      }
    });

    container.appendChild(card);
  });
}

// 2: COMPANIONS

function renderCompanions() {
  const container = document.getElementById('companionsGrid');
  if (!container) return;
  container.innerHTML = '';

  companions.forEach(c => {
    const isSelected = state.selectedCompanions.some(item => item.id === c.id);
    const card = document.createElement('div');
    card.className = `card companion-card ${isSelected ? 'selected' : ''}`;
    
    card.innerHTML = `
      <img src="${c.img}" alt="${c.name}">
      <h3>${c.name}</h3>
    `;

    card.onclick = () => {
      if (isSelected) {
        state.selectedCompanions = state.selectedCompanions.filter(item => item.id !== c.id);
      } else {
        state.selectedCompanions.push(c);
      }
      renderCompanions();
      document.getElementById('toStep3Btn').disabled = state.selectedCompanions.length === 0;
    };

    container.appendChild(card);
  });
}

document.getElementById('toStep3Btn').addEventListener('click', () => goToStep(3));

// 3: CALENDAR

const dateInput = document.getElementById('visitDate');
if (dateInput) {
  dateInput.min = new Date().toISOString().split('T')[0];

  dateInput.addEventListener('change', (e) => {
    state.selectedDate = e.target.value;
    document.getElementById('toStep4Btn').disabled = !state.selectedDate;
  });
}

document.getElementById('toStep4Btn').addEventListener('click', () => {
  renderSummary();
  goToStep(4);
});

// 4 & 5: SUMMARY & TELEGRAM SUBMIT

function renderSummary() {
  const container = document.getElementById('summaryCard');
  if (!container) return;
  const people = state.selectedCompanions.map(c => c.name).join(', ');

  container.innerHTML = `
    <div class="summary-item">
      <label>Выбранный музей</label>
      <span>${state.selectedMuseum.title}</span>
    </div>
    <div class="summary-item">
      <label>Кто идет</label>
      <span>${people}</span>
    </div>
    <div class="summary-item">
      <label>Дата посещения</label>
      <span>${state.selectedDate}</span>
    </div>
  `;
}

document.getElementById('finalSubmitBtn').addEventListener('click', async () => {
  const people = state.selectedCompanions.map(c => c.name).join(', ');

  try {
    const response = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        museum: state.selectedMuseum.title,
        companions: people,
        date: state.selectedDate
      })
    });

    if (!response.ok) {
      throw new Error('Ошибка при отправке');
    }
    
    // Сохраняем в историю и перерисовываем
    saveCurrentMuseumToVisited();
    state.selectedMuseum = null;
    document.getElementById('toStep2Btn').disabled = true;

    renderMuseums();
    renderVisitedMuseums();

    confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
    goToStep(5);
  } catch (err) {
    alert('Произошла ошибка при отправке заявки.');
    console.error(err);
  }
});

// INIT

renderMuseums();
renderVisitedMuseums();
renderCompanions();