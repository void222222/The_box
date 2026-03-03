document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const rawReviews = document.getElementById('rawReviews');
    const removeEmpty = document.getElementById('removeEmpty');
    const trimSpaces = document.getElementById('trimSpaces');
    const addStars = document.getElementById('addStars');
    const addQuotes = document.getElementById('addQuotes');
    const processBtn = document.getElementById('processBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultArea = document.getElementById('resultArea');
    const totalReviewsSpan = document.getElementById('totalReviews');
    const topWordsSpan = document.getElementById('topWords');
    const processedReviewsDiv = document.getElementById('processedReviews');
    const copyBtn = document.getElementById('copyBtn');

    // Lista de stopwords genérica (palavras muito comuns em vários idiomas)
    const stopwords = [
        'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'at', 'from',
        'by', 'on', 'off', 'for', 'in', 'out', 'over', 'under', 'again', 'further', 'then',
        'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
        'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
        'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should',
        'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn',
        'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn',
        'wasn', 'weren', 'won', 'wouldn', 'de', 'da', 'do', 'em', 'um', 'uma', 'para', 'com',
        'por', 'na', 'no', 'nas', 'nos', 'ao', 'aos', 'à', 'às', 'pelo', 'pela', 'pelos',
        'pelas', 'se', 'mas', 'como', 'mais', 'muito', 'foi', 'ser', 'são', 'meu', 'minha',
        'seu', 'sua', 'nosso', 'nossa', 'teu', 'tua', 'este', 'esta', 'esse', 'essa', 'aquele',
        'aquela', 'isto', 'isso', 'aquilo', 'já', 'agora', 'ainda', 'bem', 'mal', 'quase',
        'só', 'apenas', 'também', 'sempre', 'nunca', 'talvez', 'assim', 'porque', 'pois',
        'portanto', 'contudo', 'então', 'enquanto', 'durante', 'desde', 'até', 'entre', 'sobre',
        'contra', 'sem', 'sob', 'perante', 'após', 'pra', 'pro', 'tá', 'ta', 'vc', 'voce',
        'vai', 'está', 'estao', 'estavam', 'estava', 'foram', 'pode', 'podem', 'podia', 'ficar',
        'ficou', 'fica', 'dizer', 'disse', 'falar', 'falou', 'gente', 'coisa', 'coisas', 'todo',
        'toda', 'todos', 'todas', 'cada', 'algum', 'alguma', 'alguns', 'algumas', 'nenhum',
        'nenhuma', 'outro', 'outra', 'outros', 'outras', 'mesmo', 'mesma', 'mesmos', 'mesmas',
        'tão', 'tanto', 'tanta', 'tantos', 'tantas', 'quão', 'quanto', 'quanta', 'quantos',
        'quantas', 'quem', 'cujo', 'cuja', 'cujos', 'cujas', 'onde', 'aonde', 'donde', 'quando',
        'como', 'porque', 'logo', 'todavia', 'entretanto', 'porém', 'no entanto', 'aliás',
        'ou seja', 'isto é', 'ou', 'nem', 'inclusive', 'ademais', 'além disso', 'primeiramente',
        'finalmente', 'por último', 'primeiro', 'segundo', 'terceiro', 'depois', 'antes', 'hoje',
        'amanhã', 'ontem', 'jamais', 'raramente', 'às vezes', 'eventualmente', 'provavelmente',
        'certamente', 'realmente', 'exatamente', 'justamente', 'somente', 'simplesmente',
        'praticamente', 'aproximadamente', 'cerca de', 'perto de', 'longe de', 'dentro', 'fora',
        'acima', 'abaixo', 'diante', 'atrás', 'trás', 'ante', 'perante', 'num', 'numa', 'dum',
        'duma', 'naquele', 'naquela', 'naqueles', 'naquelas', 'daquele', 'daquela', 'daqueles',
        'daquelas', 'àquele', 'àquela', 'àqueles', 'àquelas', 'neste', 'nesta', 'nestes', 'nestas',
        'deste', 'desta', 'destes', 'destas', 'nisto', 'disso', 'nisso', 'disto', 'àquele',
        'àquela', 'àqueles', 'àquelas', 'naquilo', 'daquilo', 'àquilo'
    ];

    // Função para verificar se uma linha é provavelmente um metadado (não uma avaliação)
    function isMetadata(line) {
        const trimmed = line.trim();
        if (trimmed === '') return true;

        // Linhas muito curtas são provavelmente metadados
        if (trimmed.length < 4) return true;

        // Verifica se a linha contém muitos números em relação a letras
        const letters = (trimmed.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
        const numbers = (trimmed.match(/[0-9]/g) || []).length;
        if (numbers > letters && letters < 5) return true;

        // Verifica padrões comuns de datas (ex: "30 out. 2025", "2025-10-30", "10/30/2025")
        const datePatterns = [
            /\b\d{1,2}\s+\w+\s+\d{4}\b/,       // 30 out. 2025
            /\b\d{4}-\d{2}-\d{2}\b/,            // 2025-10-30
            /\b\d{2}\/\d{2}\/\d{4}\b/,           // 10/30/2025
            /\b\d{2}\.\d{2}\.\d{4}\b/,           // 30.10.2025
            /\b\d{1,2}\s+de\s+\w+\s+de\s+\d{4}\b/ // 30 de outubro de 2025
        ];
        for (let pattern of datePatterns) {
            if (pattern.test(trimmed)) return true;
        }

        // Verifica se a linha contém palavras-chave comuns em metadados (em vários idiomas)
        // Usamos uma abordagem mais segura: verificar se a linha tem muitas palavras curtas (possivelmente menu)
        const words = trimmed.split(/\s+/);
        const shortWords = words.filter(w => w.length < 4).length;
        if (words.length > 3 && shortWords / words.length > 0.6) return true;

        // Verifica se a linha é composta principalmente por caracteres especiais
        const specialChars = (trimmed.match(/[^a-zA-Z0-9À-ÿ\s]/g) || []).length;
        if (specialChars > letters && letters < 3) return true;

        // Verifica se a linha parece ser um comando (ex: "Mais opções", "Ver mais", "Responder")
        // Isso é mais complexo, então vamos confiar nas heurísticas acima

        return false;
    }

    // Função para limpar o texto da avaliação (remove metadados residuais)
    function cleanReviewText(text) {
        // Remove URLs
        text = text.replace(/https?:\/\/[^\s]+/g, '');
        // Remove números de telefone
        text = text.replace(/\b(?:\d{2,}[-\s]?)+\d{2,}\b/g, '');
        // Remove tags HTML
        text = text.replace(/<[^>]*>/g, '');
        // Remove espaços extras
        text = text.replace(/\s+/g, ' ').trim();
        return text;
    }

    // Função para extrair avaliações do texto bruto
    function extractReviews(text) {
        // Divide em linhas
        let lines = text.split(/\r?\n/);

        // Filtra linhas que não são metadados
        let relevantLines = lines.filter(line => !isMetadata(line));

        // Se a opção "remover espaços" estiver ativa, aplica trim
        if (trimSpaces.checked) {
            relevantLines = relevantLines.map(line => line.trim().replace(/\s+/g, ' '));
        }

        // Agrupa linhas que provavelmente pertencem à mesma avaliação
        // Estratégia: se uma linha termina com pontuação (., !, ?) e a próxima começa com maiúscula, separa
        let reviews = [];
        let currentReview = '';

        for (let i = 0; i < relevantLines.length; i++) {
            let line = relevantLines[i];

            if (currentReview === '') {
                currentReview = line;
            } else {
                // Verifica se a linha atual parece ser uma nova avaliação
                // Critério: linha começa com maiúscula e a anterior termina com pontuação
                const prevLine = relevantLines[i - 1] || '';
                const endsWithPunctuation = /[.!?]$/.test(prevLine);
                const startsWithCapital = /^[A-ZÀ-Ú]/.test(line);

                if (endsWithPunctuation && startsWithCapital && currentReview.length > 15) {
                    reviews.push(cleanReviewText(currentReview));
                    currentReview = line;
                } else {
                    currentReview += ' ' + line;
                }
            }
        }

        if (currentReview) {
            reviews.push(cleanReviewText(currentReview));
        }

        // Remove avaliações muito curtas (menos de 10 caracteres)
        reviews = reviews.filter(r => r.length >= 10);

        return reviews;
    }

    // Função para contar palavras (ignorando stopwords)
    function countWords(reviews) {
        const wordCount = {};
        const allText = reviews.join(' ').toLowerCase();
        // Divide em palavras, ignorando pontuação
        const words = allText.split(/[^\wÀ-ÿ]+/).filter(w => w.length > 2 && !stopwords.includes(w));

        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });

        return wordCount;
    }

    // Função principal de processamento
    function processReviews() {
        const text = rawReviews.value;

        // Extrai avaliações
        let reviews = extractReviews(text);

        // Aplica opções de formatação
        let formattedReviews = reviews.map(review => {
            let result = review;
            if (addStars.checked) result = '⭐ ' + result;
            if (addQuotes.checked) result = '"' + result + '"';
            return result;
        });

        // Atualiza estatísticas
        totalReviewsSpan.textContent = formattedReviews.length;

        // Contagem de palavras
        const wordCount = countWords(reviews);
        const sortedWords = Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word, count]) => `${word} (${count})`);

        topWordsSpan.textContent = sortedWords.length ? sortedWords.join(', ') : 'Nenhuma palavra relevante';

        // Exibe avaliações processadas
        let html = '';
        formattedReviews.forEach((review, index) => {
            html += `<div class="review-item"><span class="review-number">${index + 1}</span> ${review}</div>`;
        });

        processedReviewsDiv.innerHTML = html || '<div class="review-item">Nenhuma avaliação encontrada.</div>';

        // Mostra a área de resultado
        resultArea.style.display = 'block';
    }

    // Função para limpar tudo
    function clearAll() {
        rawReviews.value = '';
        resultArea.style.display = 'none';
    }

    // Função para copiar avaliações processadas
    function copyReviews() {
        const reviewItems = document.querySelectorAll('.review-item');
        let textToCopy = '';
        reviewItems.forEach((item, index) => {
            const text = item.innerText.replace(/^\d+\s/, '');
            textToCopy += text + '\n';
        });

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Avaliações copiadas para a área de transferência!');
        }).catch(() => {
            alert('Erro ao copiar. Selecione manualmente.');
        });
    }

    // Event listeners
    processBtn.addEventListener('click', processReviews);
    clearBtn.addEventListener('click', clearAll);
    copyBtn.addEventListener('click', copyReviews);

    // Exemplo inicial (opcional)
    rawReviews.value = `Opiniões em destaque
321 comentários
A deo colônia é elogiada por seu cheiro agradável...
Produto excelente, chegou rápido.
Material muito bom, recomendo!
Podia ser um pouco maior, mas atende.`;
});