// ARQUIVO: script.js (VERSÃO FINAL COM CORREÇÃO DE LINKS E EXIBIÇÃO DE MÚLTIPLOS CERTIFICADOS)

let certificadosEncontrados = [];

// URL DA PLANILHA GOOGLE:
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYKOLT1mPc9wRiKUSzfNp_Ujy0fhOGcTdki6FrEpKYH-d0Dh0P50AjVr3FEXxdpFCZKvTyCLbutPBV/pub?gid=0&single=true&output=csv';

// Função para limpar e padronizar o texto
const limparTexto = (texto) => String(texto).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').trim();

// --- FUNÇÃO PRINCIPAL PARA BUSCAR E PROCESSAR DADOS CSV ---
async function carregarDadosPlanilha() {
    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) {
            throw new Error(`Erro ao carregar a planilha: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        
        const linhas = csvText.split('\n').slice(1).filter(line => line.trim() !== '');

        return linhas.map(linha => {
            const colunas = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());

            return {
                nome_completo: colunas[1] || '',
                nome_curso: colunas[2] || 'CURSO INDEFINIDO',
                instituicao_filial: colunas[3] || 'Filial Desconhecida',
                url_pdf: colunas[4] || '',
            };
        });

    } catch (error) {
        console.error('Erro fatal ao buscar a planilha:', error);
        return []; 
    }
}


// --- LÓGICA PRINCIPAL DO EVENTO ---
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formBuscaCertificado');
    const areaPrevia = document.getElementById('areaPrevia');
    const mensagem = document.getElementById('mensagem');
    
    if (areaPrevia) areaPrevia.classList.add('hidden');
    if (mensagem) mensagem.classList.add('hidden');

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            event.stopPropagation();

            if (areaPrevia) areaPrevia.innerHTML = '';
            if (mensagem) mensagem.classList.add('hidden');
            if (areaPrevia) areaPrevia.classList.add('hidden');
            
            const dadosCertificados = await carregarDadosPlanilha();
            const nomeCompletoBusca = limparTexto(document.getElementById('nomeCompleto').value);

            if (!nomeCompletoBusca) {
                mostrarMensagem('Por favor, preencha o nome completo.', true);
                return;
            }

            const encontrados = dadosCertificados.filter(c =>
                limparTexto(c.nome_completo) === nomeCompletoBusca
            );

            if (encontrados.length > 0) {
                certificadosEncontrados = encontrados;
                mostrarPreviaCertificados(certificadosEncontrados);
            } else {
                mostrarMensagem(null, false);
            }
        });
    }

    // 🏆 FUNÇÃO CORRIGIDA PARA EXIBIR LINKS DE VISUALIZAÇÃO/DOWNLOAD 🏆
    function mostrarPreviaCertificados(certificados) {
        let html = '<h2>Confirme Seu(s) Certificado(s)</h2>';
        let linksHtml = '';

        certificados.forEach((cert, index) => {
            
            // 1. Geração da prévia do certificado
            html += `
                <div class="certificado-previa">
                    <h4>Certificado ${index + 1}: ${cert.nome_curso}</h4>
                    <p><strong>Nome Completo:</strong> ${cert.nome_completo}</p>
                    <p><strong>Instituição:</strong> ${cert.instituicao_filial}</p>
                </div>
            `;
            if (certificados.length > 1 && index < certificados.length - 1) {
                html += '<hr>';
            }

            // 2. Geração dos links de visualização/download
            const urlPdf = cert.url_pdf;
            if (urlPdf && urlPdf.trim() !== '') {
                
                // ❗ CORREÇÃO FINAL: Usamos o URL original do Drive (view?usp=sharing), 
                // que comprovadamente funciona na aba anônima.
                const downloadUrl = urlPdf; 

                linksHtml += `
                    <a href="${downloadUrl}" target="_blank" 
                       class="btn-principal btn-sim link-download" 
                       style="display: block; margin-bottom: 10px; text-align: center;">
                        Ver/Baixar Certificado ${index + 1}: ${cert.nome_curso}
                    </a>
                `;
            } else {
                 linksHtml += `
                    <p class="aviso-link-invalido">Certificado ${index + 1}: ${cert.nome_curso} - Link indisponível na planilha. </p>
                `;
            }
        });

        // Montagem final do HTML da área de prévia
        html += `
            <div class="confirma-acao">
                <h3>Seu(s) certificado(s) acima está(ão) correto(s)?</h3>
                ${linksHtml}
                <button id="btnNao" class="btn-principal btn-secundario">Não, Preciso Corrigir</button>
            </div>
        `;

        if (areaPrevia) {
            areaPrevia.innerHTML = html;
            areaPrevia.classList.remove('hidden'); 
            
            // O botão 'Sim' foi substituído pelos links, então só mantemos o 'Não'
            document.getElementById('btnNao').addEventListener('click', () => mostrarMensagem(null, false)); 
        } else {
            console.error("Elemento 'areaPrevia' não encontrado.");
        }
    }
    // FIM DA FUNÇÃO CORRIGIDA

    function mostrarMensagem(customMessage, isError) {
        if (areaPrevia) areaPrevia.classList.add('hidden'); // Esconde a prévia

        const defaultMessage = `
            <p>Seu certificado não foi encontrado ou está incorreto. </p>
            <p>Por favor, compareça à Secretaria da Juventude (SEMJUV) para correção. </p>
            <p class="horario-semjuv">Disponível de <strong>Segunda a Sexta-feira</strong>, nos horários: <br>
            <strong>8:30 às 17:00</strong></p>
        `;
        
        if (mensagem) {
            mensagem.innerHTML = customMessage ? `<p>${customMessage}</p>` : defaultMessage;
            
            // Aplica classes de estilo
            mensagem.className = 'mensagem-orientacao'; 
            mensagem.style.backgroundColor = isError ? '#f8d7da' : '#fff3cd'; 
            mensagem.style.color = isError ? '#721c24' : '#856404';

            mensagem.classList.remove('hidden'); 
        }
    }
});