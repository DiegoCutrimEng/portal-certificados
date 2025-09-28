// ARQUIVO: script.js (versão Planilha HTML + Google Drive)

let certificadosEncontrados = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formBuscaCertificado');
    const areaPrevia = document.getElementById('areaPrevia');
    const mensagem = document.getElementById('mensagem');
    
    // URL da planilha publicada em HTML
    const API_URL_HTML = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYKOLT1mPc9wRiKUSzfNp_Ujy0fhOGcTdki6FrEpKYH-d0Dh0P50AjVr3FEXxdpFCZKvTyCLbutPBV/pubhtml';

    // Função para limpar e padronizar o texto
    const limparTexto = (texto) => String(texto).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').trim();

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            event.stopPropagation();

            areaPrevia.innerHTML = '';
            mensagem.classList.add('hidden');
            areaPrevia.classList.add('hidden');

            const nomeCompletoBusca = limparTexto(document.getElementById('nomeCompleto').value);
            const nomeCursoBusca = 'OUTROS CURSOS'; 

            if (!nomeCompletoBusca) {
                mostrarMensagem('Por favor, preencha o nome completo.', true);
                return;
            }

            try {
                // Busca e parse do HTML da planilha
                const response = await fetch(API_URL_HTML);
                const htmlText = await response.text();
                
                // Criar um DOM temporário para extrair os dados
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');
                
                // Seleciona todas as linhas da planilha (tr)
                const linhas = Array.from(doc.querySelectorAll('table tbody tr'));
                let dadosCertificados = [];

                linhas.forEach((linha) => {
                    const colunas = Array.from(linha.querySelectorAll('td')).map(td => td.textContent.trim());
                    if (colunas.length < 4) return;

                    const nomeAluno = limparTexto(colunas[0]);
                    const nomeCurso = limparTexto(colunas[1]);
                    const filial = colunas[2];
                    const urlPdf = colunas[3];

                    const buscaFlexivel = nomeCursoBusca === 'OUTROS CURSOS';

                    if (nomeAluno === nomeCompletoBusca && buscaFlexivel) {
                        dadosCertificados.push({
                            nome_completo: colunas[0],
                            nome_curso: colunas[1],
                            instituicao_filial: filial,
                            url_download: formatarLinkDrive(urlPdf)
                        });
                    }
                });

                if (dadosCertificados.length > 0) {
                    certificadosEncontrados = dadosCertificados;
                    mostrarPreviaCertificados(certificadosEncontrados);
                } else {
                    mostrarMensagem(null, false);
                }

            } catch (error) {
                console.error('Erro ao ler a planilha HTML:', error);
                mostrarMensagem('Erro: Não foi possível ler os dados da Planilha. Verifique se o link está correto.', true);
            }
        });
    }

    // --- FUNÇÕES DE EXIBIÇÃO E DOWNLOAD ---

    function mostrarPreviaCertificados(certificados) {
        let html = '<h2>Prévia do(s) Seu(s) Certificado(s)</h2>';

        certificados.forEach((cert, index) => {
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
        });

        html += `
            <div class="confirma-acao">
                <h3>Seu(s) certificado(s) acima está(ão) correto(s)?</h3>
                <button id="btnSim" class="btn-principal btn-sim">Sim, Ver Certificado</button>
                <button id="btnNao" class="btn-principal btn-secundario">Não, Preciso Corrigir</button>
            </div>
        `;

        areaPrevia.innerHTML = html;
        areaPrevia.classList.remove('hidden'); 
        
        document.getElementById('btnSim').addEventListener('click', acaoSim);
        document.getElementById('btnNao').addEventListener('click', () => mostrarMensagem(null, false)); 
    }

    function acaoSim() {
        if (certificadosEncontrados.length > 0) {
            const urlPdf = certificadosEncontrados[0].url_download; 
            if (urlPdf) {
                window.open(urlPdf, '_blank');
            } else {
                mostrarMensagem('Erro: O link do certificado não foi encontrado. Contate a secretaria.', true);
            }
        }
    }

    function mostrarMensagem(customMessage, isError) {
        const defaultMessage = `
            <p>Seu certificado não foi encontrado ou está incorreto. </p>
            <p>Por favor, compareça à Secretaria da Juventude (SEMJUV) para correção. </p>
            <p class="horario-semjuv">Disponível de <strong>Segunda a Sexta-feira</strong>, nos horários: <br>
            <strong>8:30 às 12:30</strong></p>
        `;
        
        mensagem.innerHTML = customMessage ? `<p>${customMessage}</p>` : defaultMessage;
        mensagem.style.backgroundColor = isError ? '#f8d7da' : '#fff3cd'; 
        mensagem.style.color = isError ? '#721c24' : '#856404';
        areaPrevia.classList.add('hidden'); 
        mensagem.classList.remove('hidden'); 
    }

    // --- CONVERTER LINK DO DRIVE ---
    function formatarLinkDrive(url) {
        if (!url) return "";
        const match = url.match(/\/d\/(.*)\/view/);
        if (match && match[1]) {
            return `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
        return url; // Se já estiver formatado
    }
});
