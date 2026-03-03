document.addEventListener('DOMContentLoaded', function () {
    const cepInput = document.getElementById('cep');
    const searchBtn = document.getElementById('searchBtn');
    const resultArea = document.getElementById('resultArea');
    const loading = document.getElementById('loading');
    const resultContent = document.getElementById('resultContent');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const clearBtn = document.getElementById('clearBtn');
    
    const resultCep = document.getElementById('resultCep');
    const resultLogradouro = document.getElementById('resultLogradouro');
    const resultBairro = document.getElementById('resultBairro');
    const resultCidade = document.getElementById('resultCidade');
    const resultEstado = document.getElementById('resultEstado');
    const resultDdd = document.getElementById('resultDdd');

    function formatCep(value) {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 5) {
            return numbers;
        } else {
            return numbers.slice(0, 5) + '-' + numbers.slice(5, 8);
        }
    }

    cepInput.addEventListener('input', function (e) {
        e.target.value = formatCep(e.target.value);
    });

    function clearResults() {
        resultArea.style.display = 'none';
        errorMessage.style.display = 'none';
        cepInput.value = '';
        cepInput.focus();
    }

    clearBtn.addEventListener('click', clearResults);

    async function searchCep() {
        let cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            errorText.textContent = 'CEP inválido. Digite um CEP com 8 dígitos.';
            errorMessage.style.display = 'flex';
            resultArea.style.display = 'none';
            return;
        }

        loading.style.display = 'block';
        resultArea.style.display = 'block';
        resultContent.style.display = 'none';
        errorMessage.style.display = 'none';

        try {
            const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('CEP não encontrado.');
                } else {
                    throw new Error('Erro na consulta. Tente novamente.');
                }
            }

            const data = await response.json();

            resultCep.textContent = cepInput.value;
            resultLogradouro.textContent = data.street || 'Não informado';
            resultBairro.textContent = data.neighborhood || 'Não informado';
            resultCidade.textContent = data.city || 'Não informado';
            resultEstado.textContent = data.state || 'Não informado';
            resultDdd.textContent = data.ddd || 'Não informado';

            loading.style.display = 'none';
            resultContent.style.display = 'block';

        } catch (error) {
            loading.style.display = 'none';
            resultContent.style.display = 'none';
            errorText.textContent = error.message || 'Erro ao consultar CEP.';
            errorMessage.style.display = 'flex';
        }
    }

    searchBtn.addEventListener('click', searchCep);

    cepInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchCep();
        }
    });

    // CORREÇÃO: Permite Ctrl+V (cola) e outros atalhos
    cepInput.addEventListener('keydown', function (e) {
        // Permite Ctrl+V, Ctrl+C, Ctrl+X, Ctrl+A, etc. (qualquer combinação com Ctrl ou Cmd)
        if (e.ctrlKey || e.metaKey) {
            return; // não bloqueia
        }
        
        // Permite teclas de navegação/edição
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        if (allowedKeys.includes(e.key)) {
            return;
        }
        
        // Permite apenas dígitos e hífen (mas o hífen é inserido automaticamente pela formatação)
        if (!/[\d-]/.test(e.key)) {
            e.preventDefault();
        }
    });
});