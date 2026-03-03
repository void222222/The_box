document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const productName = document.getElementById('productName');
    const specs = document.getElementById('specs');
    const toneSelect = document.getElementById('tone');
    const keywordsInput = document.getElementById('keywords');
    const includeEmoji = document.getElementById('includeEmoji');
    const includeCta = document.getElementById('includeCta');
    const includeSeo = document.getElementById('includeSeo');
    const generateBtn = document.getElementById('generateBtn');
    const resultArea = document.getElementById('resultArea');
    const descriptionOutput = document.getElementById('descriptionOutput');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');

    // Função para extrair especificações do texto
    function parseSpecs(specsText) {
        const lines = specsText.split(/\r?\n/).filter(line => line.trim() !== '');
        const specList = [];
        lines.forEach(line => {
            // Tenta separar por ":" ou ";" ou "-"
            let parts = line.split(/[:;]/);
            if (parts.length >= 2) {
                specList.push({ label: parts[0].trim(), value: parts.slice(1).join(':').trim() });
            } else {
                // Se não tiver separador, trata como item simples
                specList.push({ label: null, value: line.trim() });
            }
        });
        return specList;
    }

    // Função para gerar a descrição conforme o tom
    function generateDescription() {
        const name = productName.value.trim() || 'Produto';
        const specLines = specs.value.trim();
        const keywords = keywordsInput.value.split(',').map(k => k.trim()).filter(k => k);
        const emoji = includeEmoji.checked;
        const cta = includeCta.checked;
        const seo = includeSeo.checked;
        const tone = toneSelect.value;

        if (!specLines) {
            alert('Por favor, insira as especificações do produto.');
            return;
        }

        const specList = parseSpecs(specLines);

        // Gera título
        let title = name;
        if (seo) title = `**${title}**`;

        // Corpo da descrição
        let body = '';

        // Introdução conforme tom
        switch (tone) {
            case 'professional':
                body = `Apresentamos o(a) ${name}, desenvolvido(a) com materiais de alta qualidade para garantir durabilidade e performance. `;
                break;
            case 'casual':
                body = `Olha só que legal: o(a) ${name} chegou pra facilitar seu dia a dia! `;
                break;
            case 'persuasive':
                body = `Você não vai querer ficar sem o(a) ${name}! Ele(a) oferece tudo o que você precisa com a melhor relação custo-benefício. `;
                break;
            case 'funny':
                body = `Se você ainda não conhece o(a) ${name}, está perdendo tempo! (E dinheiro). `;
                break;
        }

        if (emoji) {
            switch (tone) {
                case 'professional': body = '🔹 ' + body; break;
                case 'casual': body = '😊 ' + body; break;
                case 'persuasive': body = '🔥 ' + body; break;
                case 'funny': body = '😂 ' + body; break;
            }
        }

        // Lista de especificações formatada
        body += '\n\n**Principais características:**\n';
        specList.forEach(item => {
            if (item.label) {
                body += `\n• **${item.label}:** ${item.value}`;
            } else {
                body += `\n• ${item.value}`;
            }
        });

        // Adiciona palavras-chave
        if (keywords.length > 0) {
            body += `\n\n**Palavras-chave:** ${keywords.join(', ')}.`;
        }

        // Conclusão / CTA
        if (cta) {
            switch (tone) {
                case 'professional':
                    body += '\n\nAdquira já o seu e tenha a qualidade que você merece.';
                    break;
                case 'casual':
                    body += '\n\n👉 Corre lá e garanta o seu!';
                    break;
                case 'persuasive':
                    body += '\n\n🚀 Aproveite esta oferta exclusiva! Clique em "Comprar" agora mesmo.';
                    break;
                case 'funny':
                    body += '\n\n🛒 Compre sem medo – a gente promete que não vai morder (a não ser que seja chocolate).';
                    break;
            }
            if (emoji) body += ' 😉';
        }

        // Formatação final
        let finalText = title + '\n\n' + body;

        descriptionOutput.textContent = finalText;
        resultArea.style.display = 'block';
    }

    // Copiar texto
    copyBtn.addEventListener('click', function () {
        const text = descriptionOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert('Descrição copiada!');
        }).catch(() => {
            alert('Erro ao copiar. Selecione manualmente.');
        });
    });

    // Limpar tudo
    clearBtn.addEventListener('click', function () {
        productName.value = '';
        specs.value = '';
        keywordsInput.value = '';
        resultArea.style.display = 'none';
    });

    // Gerar ao clicar no botão
    generateBtn.addEventListener('click', generateDescription);
});