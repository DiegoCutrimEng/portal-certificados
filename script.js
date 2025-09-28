// ARQUIVO: script.js (CÓDIGO FINAL DE PROJETO)

let certificadosEncontrados = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formBuscaCertificado');
    const areaPrevia = document.getElementById('areaPrevia');
    const mensagem = document.getElementById('mensagem');
    
    // URL CSV FINAL (Publicado na Web). 
    const API_URL_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYKOLT1mPc9wRiKUSzfNp_Ujy0fhOGcTdki6FrEpKYH-d0Dh0P50AjVr3FEXxdpFCZKvTyCLbutPBV/pub?output=csv'; 
    
    // Função para limpar e padronizar o texto (remove acentos, espaços extras e coloca em MAIÚSCULAS)
    const limparTexto = (texto) => String(texto).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').trim();

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); 
            event.stopPropagation(); // Impede a ação dupla do navegador

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
                // LER O CONTEÚDO CSV DIRETAMENTE
                const response = await fetch(API_URL_CSV);
                const csvText = await response.text();
                
                // PROCESSAR O CSV 
                const linhas = csvText.trim().split('\n');
                let dadosCertificados = [];

                for (let i = 1; i < linhas.length; i++) {
                    // CORREÇÃO FINAL: Usando a VÍRGULA (,) como separador para o CSV Universal
                    const colunas = linhas[i].split(','); 
                    if (colunas.length < 4) continue; 

                    const nomeAluno = limparTexto(colunas[0]); 
                    const nomeCurso = limparTexto(colunas[1]); 
                    const filial = colunas[2].trim();          
                    const urlPdf = colunas[3].trim();          
                    
                    const buscaFlexivel = nomeCursoBusca === 'OUTROS CURSOS';

                    if (nomeAluno === nomeCompletoBusca && buscaFlexivel) {
                        dadosCertificados.push({
                            nome_completo: colunas[0].trim(),
                            nome_curso: colunas[1].trim(),
                            instituicao_filial: filial,
                            url_download: urlPdf
                        });
                    }
                }
                
                if (dadosCertificados.length > 0) {
                    certificadosEncontrados = dadosCertificados;
                    mostrarPreviaCertificados(certificadosEncontrados);
                } else {
                    mostrarMensagem(null, false);
                }

            } catch (error) {
                console.error('Erro de leitura do CSV ou Planilha:', error);
                mostrarMensagem('Erro: Não foi possível ler os dados da Planilha. Verifique se o link CSV está correto e publicado.', true);
            }
        });
    }

    // --- FUNÇÕES DE EXIBIÇÃO DE RESULTADOS E DOWNLOAD ---

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
                <button id="btnSim" class="btn-principal btn-sim">Sim, Baixar PDF</button>
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
            
            if (urlPdf && urlPdf.startsWith('http')) {
                window.open(urlPdf, '_blank');
            } else {
                 mostrarMensagem('Erro: O link de download do PDF não foi encontrado na Planilha. Contate a secretaria.', true);
            }
        }
    }

    function mostrarMensagem(customMessage, isError) {
        const defaultMessage = `
            <p>Seu certificado não foi encontrado ou está incorreto. </p>
            <p>Por favor, compareça à Secretaria da Juventude (SEMJUV) para correção. </p>
            <p class="horario-semjuv">Disponível de **Segunda a Sexta-feira**, nos horários: <br>
            **8:30 às 12:30**</p>
        `;
        
        mensagem.innerHTML = customMessage ? `<p>${customMessage}</p>` : defaultMessage;
        
        mensagem.style.backgroundColor = isError ? '#f8d7da' : '#fff3cd'; 
        mensagem.style.color = isError ? '#721c24' : '#856404';
        
        areaPrevia.classList.add('hidden'); 
        mensagem.classList.remove('hidden'); 
    }
});