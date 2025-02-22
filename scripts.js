// Configurações para o proxy e API do Cartola
const CONFIG = {
    API_PROXY: 'https://cors-anywhere.herokuapp.com/', // Novo proxy
    API_URL: 'https://api.cartola.globo.com/partidas',
    ESCUDOS_URL: 'https://s.glbimg.com/es/sde/f/2024/03/18',
    TIMEOUT: 15000
};

// Elemento principal onde o conteúdo será renderizado
const mainContent = document.getElementById('main-content');

// Função para buscar dados
async function fetchData() {
    showLoading();

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

        // Utilizando o CORS Proxy para contornar o CORS
        const response = await fetch(`${CONFIG.API_PROXY}${CONFIG.API_URL}`, {
            signal: controller.signal,
            headers: {
                'Origin': 'https://example.com', // Defina um valor para o cabeçalho Origin
                'x-requested-with': 'XMLHttpRequest'
            }
        });

        clearTimeout(timeout);

        if (!response.ok) throw new Error(`Erro ${response.status}`);

        const data = await response.json();

        // Verifica se há dados antes de renderizar
        if (data && data.partidas && data.partidas.length > 0) {
            renderContent(data);
        } else {
            mainContent.innerHTML = `<h3>Nenhuma partida encontrada.</h3>`;
        }

    } catch (error) {
        handleError(error);
    }
}

// Renderização do conteúdo na tela
function renderContent(data) {
    mainContent.innerHTML = data.partidas.map(partida => `
        <div class="rodada-card">
            <div class="partida-item">
                ${renderTime(partida.clube_casa_id, partida.clube_casa.nome)}
                <div class="placar">
                    ${partida.placar_oficial_mandante ?? '0'} - ${partida.placar_oficial_visitante ?? '0'}
                </div>
                ${renderTime(partida.clube_visitante_id, partida.clube_visitante.nome)}
            </div>
        </div>
    `).join('');
}

// Renderização dos times
function renderTime(clubeId, nome) {
    return `
        <div class="time-card">
            <img src="${CONFIG.ESCUDOS_URL}/${clubeId}.png" 
                 alt="${nome}" 
                 class="time-logo"
                 onerror="this.src='https://via.placeholder.com/60x60?text=LOGO'">
            <div class="time-name">${nome}</div>
        </div>
    `;
}

// Estado de Carregamento
function showLoading() {
    mainContent.innerHTML = `
        <div class="loading">
            <p>Carregando dados...</p>
        </div>
    `;
}

// Tratamento de Erros
function handleError(error) {
    console.error('Detalhes do erro:', error);
    let message = 'Erro desconhecido';
    
    if (error.message.includes('404')) {
        message = 'API não encontrada';
    } else if (error.message.includes('aborted')) {
        message = 'Conexão lenta - tente novamente';
    } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        message = 'Sem conexão com a internet ou CORS bloqueado';
    }
    
    mainContent.innerHTML = `
        <div class="error-box">
            <h3>${message}</h3>
            <button onclick="fetchData()" class="retry-btn">Tentar Novamente</button>
        </div>
    `;
}

// Iniciar a requisição ao carregar a página
document.addEventListener('DOMContentLoaded', fetchData);