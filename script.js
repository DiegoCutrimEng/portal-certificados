// ARQUIVO: frontend/script.js (Busca simplificada Apenas por Nome)

let certificadosEncontrados = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formBuscaCertificado');
    const areaPrevia = document.getElementById('areaPrevia');
    const mensagem = document.getElementById('mensagem');
    
    // URL FINAL DA SUA API
    const apiUrl = 'https://script.google.com/macros/s/AKfycbyFzAL1sLNhBcjFIgy9zOyUdBiEiI6eX1eNRSdOqlwArKYlJulAAB3otG6ZN_R_7HtjFw/exec'; 

    // Função para limpar o texto (necessário para a Planilha)
    const limparTexto = (texto) => String(texto).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').trim();

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            areaPrevia.innerHTML = '';
            mensagem.classList.add('hidden');
            areaPrevia.classList.add('hidden');

            const nomeCompleto = document.getElementById('nomeCompleto').value.trim();
            // Pega o valor "OUTROS CURSOS" do campo oculto (busca flexível)
            const nomeCurso = document.getElementById('nomeCurso').value.trim(); 

            if (!nomeCompleto) {
                mostrarMensagem('Por favor, preencha o nome completo.', true);
                return;
            }
            
            try {
                // A API (Code.gs) agora fará a busca flexível por NOME e retornará TODOS os certificados
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: nomeCompleto, curso: nomeCurso }) // nomeCurso é "OUTROS CURSOS"
                });

                const data = await response.json();

                if (data.success && data.certificados && data.certificados.length > 0) {
                    certificadosEncontrados = data.certificados; 
                    mostrarPreviaCertificados(certificadosEncontrados);
                } else {
                    mostrarMensagem(null, false);
                }

            } catch (error) {
                console.error('Erro de conexão com a API:', error);
                mostrarMensagem('Falha ao conectar ao servidor. O código está correto, mas o bloqueio persiste.', true);
            }
        });
    }

    // --- FUNÇÕES DE EXIBIÇÃO DE RESULTADOS E DOWNLOAD (Mesmas funções) ---

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
        areaPrevia.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
        
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
        
        mensagem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});