// Espera o carregamento completo do DOM antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- Slideshow de Background ---
    const backgrounds = [
        "url('./assets/fundo1.jpg')",
        "url('./assets/fundo2.png')",
        "url('./assets/fundo3.png')"
    ];

    let bgIndex = 0;

    // Função que troca o background a cada 10 segundos
    function changeBackground() {
        document.body.style.backgroundImage = backgrounds[bgIndex];
        bgIndex = (bgIndex + 1) % backgrounds.length; // passa para a próxima imagem, volta ao início se necessário
    }

    setInterval(changeBackground, 10000); // muda a cada 10s
    changeBackground(); // troca imediatamente ao carregar

    // --- Elementos do DOM ---
    // Captura todos os elementos que vamos manipular
    const petImage = document.getElementById('pet-image');
    const petNameEl = document.getElementById('pet-name');
    const petNameInput = document.getElementById('pet-name-input');
    const setNameBtn = document.getElementById('set-name-btn');

    const hungerBar = document.getElementById('hunger-bar');
    const hungerText = document.getElementById('hunger-text');
    const happinessBar = document.getElementById('happiness-bar');
    const happinessText = document.getElementById('happiness-text');
    const energyBar = document.getElementById('energy-bar');
    const energyText = document.getElementById('energy-text');
    const hygieneBar = document.getElementById('hygiene-bar');
    const hygieneText = document.getElementById('hygiene-text');

    const feedBtn = document.getElementById('feed-btn');
    const playBtn = document.getElementById('play-btn');
    const cleanBtn = document.getElementById('clean-btn');
    const sleepBtn = document.getElementById('sleep-btn');

    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const closeMessageBtn = document.getElementById('close-message-btn');

    // --- Estado do Pet ---
    // Guarda os status do pet
    let pet = {
        name: 'Buddy',
        hunger: 100,
        happiness: 100,
        energy: 100,
        hygiene: 100
    };

    // Velocidade com que cada atributo decai com o tempo
    const decayRates = {
        hunger: 0.5,
        happiness: 0.3,
        energy: 0.8,
        hygiene: 0.2
    };

    // Efeitos de cada ação nos status do pet
    const actionEffects = {
        feed: { hunger: +30, happiness: +10, energy: -5, hygiene: -5 },
        play: { hunger: -10, happiness: +30, energy: -20, hygiene: -10 },
        clean: { hunger: -5, happiness: +10, energy: -5, hygiene: +40 },
        sleep: { hunger: -10, happiness: +10, energy: +50, hygiene: -5 }
    };

    let gameInterval = null; // armazenará o setInterval que atualiza o jogo

    // --- Sons ---
    const dogBark = new Audio('./assets/som-latido.mp3');
    const sadSound = new Audio('./assets/som-triste.mp3');
    const buttonClickSound = new Audio('./assets/som-de-acao.mp3'); // Som ao clicar nos botões

    let sadSoundPlayed = false; // evita repetir o som triste continuamente
    let sadMessageShown = false; // controla a mensagem de tristeza do pet para mostrar apenas uma vez

    // --- Funções Auxiliares ---
    // Mostra a caixa de mensagem com texto
    function showMessage(message) {
        messageText.textContent = message;
        messageBox.style.display = 'flex';
    }

    // Esconde a caixa de mensagem
    function hideMessage() {
        messageBox.style.display = 'none';
    }

    // Limita um valor entre mínimo e máximo
    function clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }

    // Retorna a cor do status baseada no valor (%)
    function getStatusColor(percentage) {
        if (percentage > 70) return '#4caf50'; // verde
        if (percentage > 30) return '#ffeb3b'; // amarelo
        return '#f44336'; // vermelho
    }

    // Atualiza a interface (barras, textos e imagem do pet)
    function updateUI() {
        // Atualiza barras e cores
        hungerBar.style.width = `${pet.hunger}%`;
        hungerText.textContent = `${Math.round(pet.hunger)}%`;
        hungerBar.style.backgroundColor = getStatusColor(pet.hunger);

        happinessBar.style.width = `${pet.happiness}%`;
        happinessText.textContent = `${Math.round(pet.happiness)}%`;
        happinessBar.style.backgroundColor = getStatusColor(pet.happiness);

        energyBar.style.width = `${pet.energy}%`;
        energyText.textContent = `${Math.round(pet.energy)}%`;
        energyBar.style.backgroundColor = getStatusColor(pet.energy);

        hygieneBar.style.width = `${pet.hygiene}%`;
        hygieneText.textContent = `${Math.round(pet.hygiene)}%`;
        hygieneBar.style.backgroundColor = getStatusColor(pet.hygiene);

        // Se qualquer status estiver baixo, pet fica triste
        if (pet.hunger <= 50 || pet.happiness <= 50 || pet.energy <= 50 || pet.hygiene <= 50) {
            petImage.src = "./assets/pet-triste.webp";

            // Mostra a mensagem de tristeza apenas uma vez
            if (!sadMessageShown) {
                showMessage("Seu pet está triste demais para latir!");
                sadMessageShown = true;
            }
        } else {
            petImage.src = "./assets/pet.jpg";
            sadMessageShown = false; // reseta quando pet melhora
        }

        // Habilita/desabilita botões baseado nos status
        playBtn.disabled = pet.energy < 20;
        feedBtn.disabled = pet.hunger > 90;
        sleepBtn.disabled = pet.energy > 80;
        cleanBtn.disabled = pet.hygiene > 90;
    }

    // Aplica os efeitos de uma ação nos status do pet
    function applyActionEffects(effects) {
        for (const stat in effects) {
            if (pet.hasOwnProperty(stat)) {
                pet[stat] = clamp(pet[stat] + effects[stat], 0, 100);
            }
        }
        updateUI();
    }

    // Define o nome do pet com base no input do usuário
    function setPetName() {
        const newName = petNameInput.value.trim();
        if (newName.length > 0) {
            pet.name = newName;
            petNameEl.textContent = pet.name;
            petNameEl.style.display = 'block';
            showMessage(`O nome do seu pet agora é ${pet.name}!`);
        } else {
            showMessage("Por favor, digite um nome válido.");
        }
    }

    // --- Progressão do tempo ---
    // Decresce os status do pet a cada segundo
    function timeProgression() {
        pet.hunger = clamp(pet.hunger - decayRates.hunger, 0, 100);
        pet.happiness = clamp(pet.happiness - decayRates.happiness, 0, 100);
        pet.energy = clamp(pet.energy - decayRates.energy, 0, 100);
        pet.hygiene = clamp(pet.hygiene - decayRates.hygiene, 0, 100);
        updateUI();
        checkPetStatus(); // verifica se o pet está em situação crítica
    }

    // Verifica se algum status chegou a 0 e exibe mensagens / toca sons
    function checkPetStatus() {
        if (pet.hunger <= 0) {
            showMessage(`${pet.name} está faminto! Alimente-o logo!`);
            pet.happiness = clamp(pet.happiness - 0.5, 0, 100);
        }

        if (pet.happiness <= 0) {
            showMessage(`${pet.name} está muito triste! Brinque com ele!`);
            pet.energy = clamp(pet.energy - 0.5, 0, 100);
            if (!sadSoundPlayed) {
                sadSound.play();
                sadSoundPlayed = true;
            }
        } else {
            sadSoundPlayed = false; // reset quando pet se recupera
        }

        if (pet.energy <= 0) {
            showMessage(`${pet.name} está exausto! Ele precisa dormir!`);
            pet.happiness = clamp(pet.happiness - 0.5, 0, 100);
        }

        if (pet.hygiene <= 0) {
            showMessage(`${pet.name} está sujo! Dê um banho nele!`);
            pet.happiness = clamp(pet.happiness - 0.5, 0, 100);
        }
    }

    // --- Funções de Ação ---
    function handleFeed() {
        if (pet.hunger > 90) {
            showMessage(`${pet.name} não está com fome agora.`);
            return;
        }
        applyActionEffects(actionEffects.feed);
        showMessage(`${pet.name} comeu e está mais feliz!`);
    }

    function handlePlay() {
        if (pet.energy < 20) {
            showMessage(`${pet.name} está muito cansado para brincar.`);
            return;
        }
        applyActionEffects(actionEffects.play);
        showMessage(`${pet.name} se divertiu muito!`);
    }

    function handleClean() {
        if (pet.hygiene > 90) {
            showMessage(`${pet.name} já está limpo.`);
            return;
        }
        applyActionEffects(actionEffects.clean);
        showMessage(`${pet.name} está limpinho e cheiroso!`);
    }

    function handleSleep() {
        if (pet.energy > 80) {
            showMessage(`${pet.name} não está com sono agora.`);
            return;
        }
        applyActionEffects(actionEffects.sleep);
        showMessage(`${pet.name} tirou uma boa soneca!`);
    }

    // --- Inicialização do Jogo ---
    function initializeGame() {
        petNameEl.textContent = pet.name;
        petNameEl.style.display = 'block';
        updateUI();
        gameInterval = setInterval(timeProgression, 1000); // atualiza status a cada segundo
    }

    // --- Eventos ---
    feedBtn.addEventListener('click', handleFeed);
    playBtn.addEventListener('click', handlePlay);
    cleanBtn.addEventListener('click', handleClean);
    sleepBtn.addEventListener('click', handleSleep);

    setNameBtn.addEventListener('click', setPetName);

    closeMessageBtn.addEventListener('click', hideMessage);
    messageBox.addEventListener('click', (e) => {
        if (e.target === messageBox) hideMessage(); // fecha mensagem clicando fora do texto
    });

    // --- Clique na imagem para som específico ---
    petImage.addEventListener('click', () => {
        if (pet.happiness <= 50 || pet.energy <= 50 || pet.hunger <= 50 || pet.hygiene <= 50) {
            sadSound.currentTime = 0;
            sadSound.play(); // toca som triste
        } else {
            dogBark.currentTime = 0;
            dogBark.play(); // toca som feliz
        }
    });

    // --- Som ao clicar em qualquer botão de ação ---
    const actionButtons = document.querySelectorAll('.action-button');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            buttonClickSound.currentTime = 0; // reinicia o som
            buttonClickSound.play();
        });
    });

    // Inicia o jogo ao carregar a página
    initializeGame();
});
